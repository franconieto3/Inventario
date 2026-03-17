import { supabase } from "../config/supabase.js";

export const getTiposProcesos = async()=>{
  const { data, error } = await supabase.from('tipo_proceso').select('*').order('descripcion');
  if (error) throw error;
  return data;
}

export const getUnidadesTiempo = async ()=>{
  const { data, error } = await supabase
    .rpc('get_enum_values', { type_name: 'unidad_tiempo_enum' });

  if (error) throw error;
  else {
    return data.map(item => item.enum_value);
  }
}

export const getProcesos = async ({ page = 1, limit = 10, id_tipo_proceso }) => {

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('proceso')
    .select('*, tipo_proceso(id_tipo_proceso,descripcion)', { count: 'exact' });

  if (id_tipo_proceso) {
    query = query.eq('id_tipo_proceso', id_tipo_proceso);
  }

  const { data, count, error } = await query.range(from, to).order('id_proceso', { ascending: false });
  if (error) throw error;

  return { procesos: data, total: count, totalPages: Math.ceil(count / limit), currentPage: page };

};