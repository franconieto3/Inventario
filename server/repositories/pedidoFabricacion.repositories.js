import { supabase } from "../config/supabase.js";

// Req. 15: detalle completo de un pedido (producto, órdenes, piezas, materia prima),
// mismo estilo de select anidado que SELECT_ORDEN_FABRICACION en
// ordenFabricacion.repositories.js.
const SELECT_PEDIDO_DETALLE = `
    id_pedido,
    id_producto,
    id_estado_pedido,
    fecha_creacion,
    fecha_entrega,
    fecha_finalizacion,
    id_usuario_creador,
    producto (
        id_producto,
        nombre,
        id_rubro
    ),
    orden_fabricacion (
        id_of,
        id_pieza,
        cantidad,
        id_estado_of,
        id_orden_produccion,
        fecha_creacion,
        fecha_finalizacion,
        a_medida,
        materiales_aprobados,
        orden_fabricacion_materia_prima (
            id_materia_prima,
            identificador,
            fecha_carga
        ),
        pieza (
            id_pieza,
            nombre,
            es_ensamble,
            codigo_produccion
        )
    )
`;

// Req. 12 (actualización): crea el lote completo de órdenes (raíces + sugerencias
// aprobadas) y reparte cada una en un pedido_fabricacion propio de su producto, todo
// en una única transacción de Postgres (ver fn_crear_pedidos_fabricacion_agrupados
// en roadmap.md). Devuelve las órdenes creadas con id_pedido ya asignado.
export const crearPedidosConOrdenesAgrupados = async ({ ordenes, fecha_entrega, id_usuario_creador }) => {
    const { data, error } = await supabase.rpc('fn_crear_pedidos_fabricacion_agrupados', {
        p_ordenes: ordenes,
        p_fecha_entrega: fecha_entrega,
        p_id_usuario_creador: id_usuario_creador
    });

    if (error) {
        console.error("Error Supabase RPC (fn_crear_pedidos_fabricacion_agrupados):", error);
        const err = new Error(error.message || "Error al crear el pedido de fabricación.");
        err.statusCode = error.code === '23503' ? 400 : 500;
        throw err;
    }

    return data;
};

export const obtenerPedidosPorIds = async (idsPedido) => {
    const { data, error } = await supabase
        .from('pedido_fabricacion')
        .select()
        .in('id_pedido', idsPedido);

    if (error) {
        console.error("Error Supabase (obtenerPedidosPorIds):", error);
        const err = new Error("Error al obtener los pedidos de fabricación creados.");
        err.statusCode = 500;
        throw err;
    }

    return data;
};

export const obtenerDetallePedido = async (idPedido) => {
    const { data, error } = await supabase
        .from('pedido_fabricacion')
        .select(SELECT_PEDIDO_DETALLE)
        .eq('id_pedido', idPedido)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            const err = new Error("No se encontró el pedido de fabricación indicado.");
            err.statusCode = 404;
            throw err;
        }
        console.error("Error Supabase (obtenerDetallePedido):", error);
        const err = new Error("Error al obtener el detalle del pedido de fabricación.");
        err.statusCode = 500;
        throw err;
    }

    return data;
};

// Req. 15: registra la auditoría de impresión, validando en la misma transacción que el
// pedido esté Aceptado o En Producción (fn_registrar_impresion_pedido, ver roadmap.md).
export const registrarImpresion = async (idPedido, idUsuario) => {
    const { data, error } = await supabase.rpc('fn_registrar_impresion_pedido', {
        p_id_pedido: idPedido,
        p_id_usuario: idUsuario
    });

    if (error) {
        console.error("Error Supabase RPC (fn_registrar_impresion_pedido):", error);
        const err = new Error(error.message || "Error al registrar la impresión del pedido de fabricación.");
        err.statusCode = error.code === 'P0001' ? 400 : 500;
        throw err;
    }

    return data;
};

export const aceptarPedido = async (idPedido) => {
    const { data, error } = await supabase.rpc('fn_aceptar_pedido_fabricacion', {
        p_id_pedido: idPedido
    });

    if (error) {
        console.error("Error Supabase RPC (fn_aceptar_pedido_fabricacion):", error);
        const err = new Error(error.message || "Error al aceptar el pedido de fabricación.");
        err.statusCode = error.code === 'P0001' ? 400 : 500;
        throw err;
    }

    return data;
};
