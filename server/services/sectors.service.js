import { supabase } from "../config/supabase.js";

// Obtener todos los sectores
export const getSectores = async ()=>{
    const { data, error } = await supabase
      .from('sector')
      .select('id_sector, descripcion, created_at')
      .order('descripcion', { ascending: true });

    if (error) throw new Error(`Error al obtener sectores: ${error.message}`);
    return data;
}