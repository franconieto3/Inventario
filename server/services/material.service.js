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
    .select('*, rubro_material(descripcion), unidad_medida(descripcion)', { count: 'exact' });

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

export const getMaterialesParaSelector = async () => {

  const { data, error } = await supabase
    .from('material')
    .select('*, unidad_medida(unidad)')
    .order('descripcion');
    
  if (error) throw error;
  return data;
};

export const agregarMaterialPieza = async (idPieza, materiales) => {
  const { data, error } = await supabase.rpc('asociar_materiales_pieza', {
    p_id_pieza: idPieza,
    p_materiales: materiales
  });

  if (error) {
    if (error.code === '23505') {
      console.error('Error: Intento de duplicado detectado.');
      
      // Lanzamos un error personalizado para que el controlador HTTP lo maneje
      throw new Error('No se permiten materiales duplicados en una pieza.');
    }

    throw new Error(`Error al asociar materiales a la pieza: ${error.message}`);
  }

  return data;
};

export const quitarMaterialPieza = async (idBom)=>{
  
  const {data, error} = await supabase
    .from('pieza_bom')
    .delete()
    .eq('id_bom', idBom)
    .select();

  console.log("Eliminando: ", idBom);

  if(error){
    console.error(error);
    throw new Error("No se pudo quitar el material");
  }

  return data;
}

export const modificarBom = async (id_bom, consumo_teorico) => {
  const { data, error } = await supabase
    .from('pieza_bom')
    .update({ consumo_teorico: consumo_teorico })
    .eq('id_bom', id_bom)
    .select();

  if (error) {
    console.error(error);
    throw new Error("No se pudo modificar la cantidad del material.");
  }

  return data;
}