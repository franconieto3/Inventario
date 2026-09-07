import { supabase } from "../config/supabase.js";

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
