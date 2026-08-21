-- Extiende la creación de órdenes de fabricación para persistir a_medida
-- (la columna orden_fabricacion.a_medida ya existía en la tabla original;
-- las funciones simplemente no la usaban todavía).
--
-- a_medida se aplica solo a la orden raíz de cada entrada del array (la
-- pieza que el supervisor seleccionó explícitamente); las órdenes hijas
-- generadas automáticamente por la explosión de un ensamble quedan con
-- a_medida = false, ya que no fueron elegidas individualmente.
--
-- Ejecutar manualmente en el SQL Editor de Supabase.

-- El nuevo parámetro cambia la firma de la función, así que hay que borrar
-- la versión anterior (Postgres identifica funciones por nombre + tipos de
-- argumentos: un CREATE OR REPLACE con distinta firma crea un overload
-- nuevo en vez de reemplazarla).
drop function if exists public.fn_crear_orden_fabricacion_recursiva(integer, integer, integer, integer);

create or replace function public.fn_crear_orden_fabricacion_recursiva(
  p_id_pieza integer,
  p_cantidad integer,
  p_id_of_padre integer,
  p_profundidad integer default 0,
  p_a_medida boolean default false
) returns integer
language plpgsql
as $$
declare
  v_id_of integer;
  v_es_ensamble boolean;
  v_componente record;
begin
  if p_profundidad > 20 then
    raise exception 'Profundidad de ensamble excesiva (posible ciclo en composicion_pieza) para la pieza %', p_id_pieza;
  end if;

  insert into public.orden_fabricacion (id_of_padre, id_pieza, id_ruta, cantidad, a_medida)
  values (p_id_of_padre, p_id_pieza, null, p_cantidad, p_a_medida)
  returning id_of into v_id_of;

  insert into tmp_ordenes_creadas (id_of) values (v_id_of);

  select es_ensamble into v_es_ensamble
  from public.pieza
  where id_pieza = p_id_pieza;

  if v_es_ensamble then
    for v_componente in
      select id_pieza_hijo, cantidad as cantidad_componente
      from public.composicion_pieza
      where id_pieza_padre = p_id_pieza
    loop
      perform public.fn_crear_orden_fabricacion_recursiva(
        v_componente.id_pieza_hijo,
        p_cantidad * v_componente.cantidad_componente,
        v_id_of,
        p_profundidad + 1,
        false
      );
    end loop;
  end if;

  return v_id_of;
end;
$$;

create or replace function public.fn_crear_ordenes_fabricacion_masivo(
  p_ordenes jsonb
) returns setof public.orden_fabricacion
language plpgsql
as $$
declare
  v_orden jsonb;
begin
  create temporary table tmp_ordenes_creadas (id_of integer) on commit drop;

  for v_orden in select * from jsonb_array_elements(p_ordenes)
  loop
    perform public.fn_crear_orden_fabricacion_recursiva(
      (v_orden->>'id_pieza')::integer,
      (v_orden->>'cantidad')::integer,
      null,
      0,
      coalesce((v_orden->>'a_medida')::boolean, false)
    );
  end loop;

  return query
    select of_.*
    from public.orden_fabricacion of_
    join tmp_ordenes_creadas t on t.id_of = of_.id_of
    order by of_.id_of;
end;
$$;
