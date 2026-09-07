import { supabase } from "../config/supabase.js";

const SELECT_ORDEN_FABRICACION = `
    id_of,
    id_of_padre,
    id_pieza,
    id_ruta,
    id_estado_of,
    cantidad,
    materiales_aprobados,
    id_orden_produccion,
    fecha_creacion,
    fecha_finalizacion,
    a_medida,
    id_pedido,
    orden_fabricacion_materia_prima (
        id_materia_prima,
        identificador,
        fecha_carga
    ),
    pedido_fabricacion (
        id_pedido,
        fecha_entrega,
        id_estado_pedido
    ),
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
        .select('id_of, id_ruta, materiales_aprobados, id_estado_of')
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
        } else if (error.code === 'P0001') {
            statusCode = 400;
            message = error.message;
        }

        const err = new Error(message);
        err.statusCode = statusCode;
        throw err;
    }

    return data;
};

export const agregarMateriaPrima = async (idOf, identificador, idUsuario) => {
    const { data, error } = await supabase
        .from('orden_fabricacion_materia_prima')
        .insert({ id_of: idOf, identificador, id_usuario_carga: idUsuario })
        .select('id_materia_prima, identificador, fecha_carga')
        .single();

    if (error) {
        console.error("Error Supabase (agregarMateriaPrima):", error);

        let statusCode = 500;
        let message = "Error al agregar el identificador de materia prima.";

        if (error.code === '23505') {
            statusCode = 400;
            message = "Ese identificador ya fue cargado para esta orden.";
        } else if (error.code === '23503') {
            statusCode = 404;
            message = "No se encontró la orden de fabricación indicada.";
        }

        const err = new Error(message);
        err.statusCode = statusCode;
        throw err;
    }

    return data;
};

export const eliminarMateriaPrima = async (idOf, idMateriaPrima) => {
    const { error } = await supabase
        .from('orden_fabricacion_materia_prima')
        .delete()
        .eq('id_of', idOf)
        .eq('id_materia_prima', idMateriaPrima);

    if (error) {
        console.error("Error Supabase (eliminarMateriaPrima):", error);
        const err = new Error("Error al eliminar el identificador de materia prima.");
        err.statusCode = 500;
        throw err;
    }
};

export const obtenerOrdenCompleta = async (idOf) => {
    const { data, error } = await supabase
        .from('orden_fabricacion')
        .select(SELECT_ORDEN_FABRICACION)
        .eq('id_of', idOf)
        .single();

    if (error) {
        console.error("Error Supabase (obtenerOrdenCompleta):", error);
        const err = new Error("Error al obtener la orden de fabricación.");
        err.statusCode = 500;
        throw err;
    }

    return data;
};

// Intenta aceptar el pedido completo de la orden indicada (fn_aceptar_pedido_fabricacion,
// Req. 10/13). Se usa como disparador automático desde la aprobación de materiales
// (Req. 11 ampliado): si el pedido todavía tiene otras órdenes sin validar, la función
// rechaza la aceptación con una excepción esperada, que acá se trata como "todavía no",
// no como un error de la aprobación de materiales que sí se pudo guardar.
export const intentarAceptarPedido = async (idPedido) => {
    const { error } = await supabase.rpc('fn_aceptar_pedido_fabricacion', {
        p_id_pedido: idPedido
    });

    if (error) {
        if (error.code !== 'P0001') {
            console.error("Error Supabase RPC (fn_aceptar_pedido_fabricacion, auto-aceptación):", error);
        }
        return false;
    }

    return true;
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

// Req. 12: vista previa de sólo lectura de la explosión de componentes de una pieza
// ensamble (misma multiplicación de cantidades que antes hacía fn_crear_orden_fabricacion_recursiva,
// pero sin insertar nada). Devuelve el árbol completo (excluida la raíz); ver
// fn_sugerir_composicion_pieza en roadmap.md.
export const sugerirComposicionPieza = async (idPieza, cantidad) => {
    const { data, error } = await supabase.rpc('fn_sugerir_composicion_pieza', {
        p_id_pieza: idPieza,
        p_cantidad: cantidad
    });

    if (error) {
        console.error("Error Supabase RPC (fn_sugerir_composicion_pieza):", error);
        const err = new Error("Error al calcular las sugerencias de composición de la pieza.");
        err.statusCode = 500;
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
