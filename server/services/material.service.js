import { supabase } from "../config/supabase.js";

export const getRubros = async () => {
  const { data, error } = await supabase.from('rubro_material').select('*').order('descripcion');
  if (error) throw error;
  return data;
};

export const getUnits = async () => {
  const { data, error } = await supabase.from('unidad_medida').select('*').order('descripcion');
  if (error) throw error;
  return data;
};

export const createMaterial = async (materialData) => {
  const {data, error} = await supabase.rpc('insertar_material',{p_payload: materialData});

  if (error) throw error;
  return data;
};

export const getMateriales = async ({ page = 1, limit = 10, id_rubro_material }) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('material')
    .select('*, rubro_material(descripcion)', { count: 'exact' });

  if (id_rubro_material) {
    query = query.eq('id_rubro_material', id_rubro_material);
  }

  const { data, count, error } = await query.range(from, to).order('id_material', { ascending: false });
  if (error) throw error;

  return { materiales: data, total: count, totalPages: Math.ceil(count / limit), currentPage: page };
};