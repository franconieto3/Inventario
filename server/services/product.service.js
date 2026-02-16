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
    const {data, error} = await supabase.from('producto').select('*').eq('id_estado_producto', 1);
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

    if (error){
        console.error("Error Supabase RPC:", error);
        throw new Error("Error al guardar el producto en la base de datos.");}

    return data;
}

export const obtenerProducto = async (id)=>{

    const [productoRes, documentosRes] = await Promise.all([
        supabase
        .from('producto')
        .select(`
            *,
            pieza (*),
            rubro (descripcion),
            registro_pm(descripcion) 
        `)
        .eq('id_producto', id)
        .eq('pieza.id_estado_pieza', 1)
        .single(),
        
        // Llamada a tu función personalizada de SQL
        supabase.rpc('obtener_ultima_version_por_documento', {
        p_id_producto: id
        })
    ]);

    // Manejo de errores de la consulta de producto
    if (productoRes.error) {
        if (productoRes.error.code === 'PGRST116') {throw new Error('PGRST116');}
        else{throw productoRes.error;} 
    }

    // Manejo de errores de la función RPC (opcional, podrías devolver [] si falla)
    if (documentosRes.error) {
        //console.error("Error al obtener documentos:", documentosRes.error);
        return [productoRes, []];
    }

    return [productoRes, documentosRes];
}

export const obtenerInfoPieza = async (idPieza) => {
    const [piezaRes, documentosRes] = await Promise.all([
        supabase
        .from('pieza')
        .select('*')
        .eq('id_pieza', idPieza)
        .single(),
        supabase.rpc('obtener_ultima_version_documentos', {p_id_pieza: idPieza})
    ]);

    // Manejo de errores de la consulta de producto
    if (piezaRes.error) {
        if (piezaRes.error.code === 'PGRST116') {throw new Error('PGRST116');}
        else{throw piezaRes.error;} 
    }

    // Manejo de errores de la función RPC (opcional, podrías devolver [] si falla)
    if (documentosRes.error) {
        console.error("Error al obtener documentos:", documentosRes.error);
        return [piezaRes, []];
    }

    return [piezaRes, documentosRes];
    
}

export const verificarPieza = async (nombrePieza, codigo, idProducto, idPieza = null ) => {
    // 1. Ejecutamos la consulta con filtros combinados

    const {data, error} = await supabase.rpc('validar_pieza', {
        p_id_producto: idProducto,
        p_codigo: codigo || null,
        p_nombre: nombrePieza || null
    });

    if (error) {
        console.log(error);
        //console.error("Error en Supabase:", error.message);
        throw new Error("Error al validar la existencia de la pieza");
    }

    if (!data || data.length === 0) {
        return true; // No hay duplicados
    }

    // Creación: Si 'data' existe, significa que encontró una coincidencia
    if (idPieza === null) {
        const err = new Error('La pieza ya se encuentra registrada (nombre o código duplicado)');
        err.statusCode = 400;
        throw err;
    }
    const existeConflicto = data.some(row => row.id_pieza !== idPieza);

    if (existeConflicto) {
        const err = new Error('Otras piezas del mismo producto tienen el mismo nombre o código');
        err.statusCode = 400;
        throw err;
    }
    
    return true; // Todo en orden
};

export const crearPieza = async (nombre, codigo, id_producto) => {
    const { data, error } = await supabase.rpc('agregar_pieza', {
        p_nombre: nombre,
        p_codigo: codigo,
        p_id_producto: id_producto
    });

    if (error) {
        // Creamos el objeto de error con un mensaje base
        const err = new Error(error.message);
        err.originalError = error;

        switch (error.code) {
            case '23503':
                err.message = "El producto seleccionado no existe en la base de datos.";
                err.statusCode = 400; // Bad Request
                break;
            case '42P01':
                err.message = "Error de configuración: La tabla no fue encontrada.";
                err.statusCode = 500;
                break;
            default:
                err.message = `Error inesperado: ${error.message}`;
                err.statusCode = 500;
        }

        throw err;
    }

    console.log("Pieza procesada con éxito. ID:", data);
    return data; 
}

export const editarPieza = async (idPieza, nombrePieza, codigoPieza, esEnsamble)=>{
    const {data, error} = await supabase.rpc('actualizar_pieza',{
        p_id_pieza: idPieza,
        p_nombre: nombrePieza,
        p_codigo: codigoPieza,
        p_es_ensamble: esEnsamble});
    
    if(error){
        console.error("Detalle del error:", error.message);
        const err = new Error("Ocurrió un error. No se pudo actualizar la pieza");
        err.statusCode = 500;
        throw err;
    }

    return data;
}

export const editarProducto = async (idProducto, nombreProducto, idRegistroPm, idRubro)=>{
    
    const {data, error} = await supabase.rpc('actualizar_producto',{
        p_id_producto: idProducto,
        p_nombre: nombreProducto,
        p_id_registro_pm: idRegistroPm,
        p_id_rubro: idRubro    
    });

    if(error){
        console.error("Detalle del error:", error.message);
        const err = new Error("Ocurrió un error. No se pudo actualizar el producto");
        err.statusCode = 500;
        throw err;
    }

    return data;
}

export const eliminarPieza = async(idPieza)=>{

    const {data, error} = await supabase.rpc('eliminar_pieza', {p_id_pieza: idPieza})
    
    if(error){
        console.error("Detalle del error:", error.message);
        const err = new Error("Ocurrió un error. No se pudo eliminar la pieza");
        err.statusCode =500;
        throw err;
    }

    return data;
}

export const eliminarProducto = async(idProducto)=>{
    const {data, error} = await supabase.rpc('eliminar_producto', {p_id_producto: idProducto})
    
    if(error){
        console.error("Detalle del error:", error.message);
        const err = new Error("Ocurrió un error. No se pudo eliminar el producto");
        err.statusCode =500;
        throw err;
    }

    return data;
}