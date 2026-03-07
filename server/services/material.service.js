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

export const actualizarMaterial = async (id, data) => {
  const {
    descripcion,
    atributos,
    es_trazable,
    id_rubro_material,
    id_unidad_medida
  } = data;

  // Llamada a la función RPC en Supabase
  const { data: updatedMaterial, error } = await supabase.rpc('update_material', {
    p_id_material: id,
    p_descripcion: descripcion,
    p_atributos: atributos,
    p_es_trazable: es_trazable,
    p_id_rubro_material: id_rubro_material ? parseInt(id_rubro_material) : null,
    p_id_unidad_medida: id_unidad_medida ? parseInt(id_unidad_medida) : null
  });

  if (error) {
    // Manejo de error de constraint unique para la descripción
    if (error.code === '23505') {
      throw new Error('Ya existe un material con esa descripción.');
    }
    throw new Error(`Error al actualizar el material: ${error.message}`);
  }

  return updatedMaterial;
};

export const eliminarMaterial = async (id) => {
  const { data, error } = await supabase
    .from('material')
    .delete()
    .eq('id_material', id);

  if (error) {
    throw new Error(`Error al eliminar el material: ${error.message}`);
  }

  return data;
};