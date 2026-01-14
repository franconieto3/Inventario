import { supabase } from "../config/supabase.js";

export const obtenerRubros = async ()=>{

    const { data, error } = await supabase
        .from('rubro')
        .select('id_rubro, descripcion'); 

    if (error) throw new Error("Error al obtener rubros");

    return data;
}

export const obtenerRegistrosPm = async ()=>{
    const { data, error } = await supabase
        .from('registro_pm')
        .select('id_registro_pm, descripcion');

    if (error) throw new Error("Error al obtener registros de producto médico");

    return data;
}

export const obtenerProductos = async ()=>{
    const {data, error} = await supabase.from('producto').select('*');
    if (error) throw new Error("Error al obtener los productos");

    return data;
}

export const cargarProductos = async (nombre, id_registro_pm, id_rubro, piezas)=>{

    // Llamada a la función RPC de Supabase
    const { data, error } = await supabase.rpc('crear_producto_con_piezas', {
        nombre_prod: nombre,
        id_pm: id_registro_pm,
        id_rubro_param: id_rubro,
        piezas_json: piezas 
    });

    if (error)throw new Error("Error al guardar el producto en la base de datos.");

    return data;
}