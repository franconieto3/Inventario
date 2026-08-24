import { supabase } from "../config/supabase.js";

const SELECT_ORDEN_FABRICACION = `
    id_of,
    id_of_padre,
    id_pieza,
    id_ruta,
    id_estado_of,
    cantidad,
    id_materia_prima,
    id_orden_produccion,
    fecha_creacion,
    fecha_finalizacion,
    a_medida,
    pieza (
        id_pieza,
        nombre,
        es_ensamble,
        id_producto,
        producto (
            id_producto,
            nombre
        )
    ),
    ruta_procesos (
        id_ruta,
        nombre
    )
`;

export const crearOrdenesFabricacionMasivo = async (ordenes) => {
    const { data, error } = await supabase.rpc('fn_crear_ordenes_fabricacion_masivo', {
        p_ordenes: ordenes
    });

    if (error) {
        console.error("Error Supabase RPC (Ordenes Fabricacion Masivo):", error);
        const err = new Error(error.message || "Error al crear las órdenes de fabricación.");
        err.statusCode = error.code === '23503' ? 400 : 500;
        throw err;
    }

    return data;
};

export const listarOrdenesFabricacionPorEstados = async (estados) => {
    const { data, error } = await supabase
        .from('orden_fabricacion')
        .select(SELECT_ORDEN_FABRICACION)
        .in('id_estado_of', estados)
        .order('fecha_creacion', { ascending: false });

    if (error) {
        console.error("Error Supabase (listarOrdenesFabricacionPorEstados):", error);
        const err = new Error("Error al obtener el listado de órdenes de fabricación.");
        err.statusCode = 500;
        throw err;
    }

    return data;
};

export const obtenerOrdenPorId = async (idOf) => {
    const { data, error } = await supabase
        .from('orden_fabricacion')
        .select('id_of, id_ruta, id_materia_prima, id_estado_of')
        .eq('id_of', idOf)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error("No se encontró la orden de fabricación indicada.");
            err.statusCode = 404;
            throw err;
        }
        console.error("Error Supabase (obtenerOrdenPorId):", error);
        const err = new Error("Error al obtener la orden de fabricación.");
        err.statusCode = 500;
        throw err;
    }

    return data;
};

export const actualizarOrdenFabricacion = async (idOf, cambios) => {
    const { data, error } = await supabase
        .from('orden_fabricacion')
        .update(cambios)
        .eq('id_of', idOf)
        .select(SELECT_ORDEN_FABRICACION)
        .single();

    if (error) {
        console.error("Error Supabase (actualizarOrdenFabricacion):", error);

        let statusCode = 500;
        let message = "Error al actualizar la orden de fabricación.";

        if (error.code === '23503') {
            statusCode = 400;
            message = "La ruta de fabricación indicada no existe.";
        }

        const err = new Error(message);
        err.statusCode = statusCode;
        throw err;
    }

    return data;
};

export const cancelarOrdenFabricacion = async (idOf) => {
    const { data, error } = await supabase.rpc('fn_cancelar_orden_fabricacion', {
        p_id_of: idOf
    });

    if (error) {
        console.error("Error Supabase RPC (fn_cancelar_orden_fabricacion):", error);
        const err = new Error(error.message || "Error al cancelar la orden de fabricación.");
        err.statusCode = error.code === 'P0001' ? 400 : 500;
        throw err;
    }

    return data;
};

export const obtenerRutasPieza = async (idPieza) => {
    const { data, error } = await supabase.rpc('obtener_rutas_pieza', { p_id_pieza: idPieza });

    if (error) {
        console.error("Error Supabase RPC (obtener_rutas_pieza):", error);
        const err = new Error("Error al obtener las rutas de fabricación de la pieza.");
        err.statusCode = 500;
        throw err;
    }

    return data;
};
