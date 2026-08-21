-- Requerimientos 1 y 2 (roadmap.md): órdenes de fabricación, con soporte
-- para carga masiva y explosión automática de ensambles (composicion_pieza).
--
-- Ejecutar manualmente en el SQL Editor de Supabase.

-- =========================================================
-- 1. Tabla de estados de orden de fabricación
-- =========================================================

create table public.estado_orden_fabricacion (
  id_estado_of integer generated always as identity not null,
  descripcion character varying(50) not null,
  constraint estado_orden_fabricacion_pkey primary key (id_estado_of),
  constraint estado_of_descripcion_key unique (descripcion)
) TABLESPACE pg_default;

-- Seed: 5 estados del requerimiento 9 del roadmap, en este orden para que
-- el default id_estado_of = 1 de orden_fabricacion sea "Pendiente Diseño".
insert into public.estado_orden_fabricacion (descripcion) values
  ('Pendiente Diseño'),
  ('Pendiente Materiales'),
  ('Aceptada / En Producción'),
  ('Pausada'),
  ('Finalizada');

-- =========================================================
-- 2. Tabla de órdenes de fabricación
-- =========================================================

create table public.orden_fabricacion (
  id_of integer generated always as identity not null,
  id_of_padre integer null,
  id_pieza integer not null,
  id_ruta integer null,
  id_estado_of integer not null default 1,
  cantidad integer not null,
  id_materia_prima text null,
  id_orden_produccion text null,
  fecha_creacion timestamp with time zone not null default now(),
  fecha_finalizacion timestamp with time zone null,
  a_medida boolean not null default false,
  constraint orden_fabricacion_pkey primary key (id_of),
  constraint fk_of_padre foreign key (id_of_padre) references orden_fabricacion (id_of) on delete cascade,
  constraint fk_of_pieza foreign key (id_pieza) references pieza (id_pieza),
  constraint fk_of_ruta foreign key (id_ruta) references ruta_procesos (id_ruta),
  constraint fk_of_estado foreign key (id_estado_of) references estado_orden_fabricacion (id_estado_of),
  constraint chk_cantidad_positiva check (cantidad > 0)
) TABLESPACE pg_default;

-- =========================================================
-- 3. Función recursiva: crea una orden y, si la pieza es un ensamble,
--    explota composicion_pieza en órdenes hijas (cantidad multiplicada
--    en cascada), enlazadas a la orden recién creada vía id_of_padre.
-- =========================================================

create or replace function public.fn_crear_orden_fabricacion_recursiva(
  p_id_pieza integer,
  p_cantidad integer,
  p_id_of_padre integer,
  p_profundidad integer default 0
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

  insert into public.orden_fabricacion (id_of_padre, id_pieza, id_ruta, cantidad)
  values (p_id_of_padre, p_id_pieza, null, p_cantidad)
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
        p_profundidad + 1
      );
    end loop;
  end if;

  return v_id_of;
end;
$$;

-- =========================================================
-- 4. Punto de entrada: soporte masivo. Recibe un array JSON de
--    { id_pieza, cantidad } y devuelve todas las órdenes creadas
--    (padres e hijas) en una única transacción.
-- =========================================================

create or replace function public.fn_crear_ordenes_fabricacion_masivo(
  p_ordenes jsonb
) returns setof public.orden_fabricacion
language plpgsql
as $$
declare
  v_orden jsonb;
begin
  -- ON COMMIT DROP: se elimina automáticamente al terminar esta transacción
  -- (cada llamada RPC es su propia transacción), así que siempre arranca vacía.
  create temporary table tmp_ordenes_creadas (id_of integer) on commit drop;

  for v_orden in select * from jsonb_array_elements(p_ordenes)
  loop
    perform public.fn_crear_orden_fabricacion_recursiva(
      (v_orden->>'id_pieza')::integer,
      (v_orden->>'cantidad')::integer,
      null
    );
  end loop;

  return query
    select of_.*
    from public.orden_fabricacion of_
    join tmp_ordenes_creadas t on t.id_of = of_.id_of
    order by of_.id_of;
end;
$$;
