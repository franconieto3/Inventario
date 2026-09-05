import { supabase } from "../config/supabase.js";

export const crearPedido = async ({ id_producto, fecha_entrega, id_usuario_creador }) => {
    const { data, error } = await supabase
        .from('pedido_fabricacion')
        .insert({ id_producto, fecha_entrega, id_usuario_creador })
        .select()
        .single();

    if (error) {
        console.error("Error Supabase (crearPedido):", error);
        const err = new Error(error.code === '23503'
            ? "El producto indicado no existe."
            : "Error al crear el pedido de fabricación.");
        err.statusCode = error.code === '23503' ? 400 : 500;
        throw err;
    }

    return data;
};

export const eliminarPedido = async (idPedido) => {
    const { error } = await supabase
        .from('pedido_fabricacion')
        .delete()
        .eq('id_pedido', idPedido);

    if (error) {
        console.error("Error Supabase (eliminarPedido, limpieza best-effort):", error);
    }
};

export const asignarPedidoAOrdenes = async (idsOf, idPedido) => {
    const { error } = await supabase
        .from('orden_fabricacion')
        .update({ id_pedido: idPedido })
        .in('id_of', idsOf);

    if (error) {
        console.error("Error Supabase (asignarPedidoAOrdenes):", error);
        const err = new Error("Error al asociar las órdenes de fabricación al pedido.");
        err.statusCode = 500;
        throw err;
    }
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
