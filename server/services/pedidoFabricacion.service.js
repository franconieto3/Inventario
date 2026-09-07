import * as pedidoFabricacionRepo from "../repositories/pedidoFabricacion.repositories.js";

// Req. 12 (actualización): un pedido agrupa órdenes de un mismo producto, pero un lote
// puede incluir piezas raíz y sugerencias de composición aprobadas que pertenecen a
// productos distintos. fn_crear_pedidos_fabricacion_agrupados crea todas las órdenes del
// lote en una sola pasada (preservando id_padre_ref) y arma un pedido_fabricacion por
// cada producto distinto entre esas piezas, todo en una única transacción de Postgres.
export const crearPedidoConOrdenes = async (fechaEntrega, idUsuarioCreador, ordenes) => {
    const ordenesCreadas = await pedidoFabricacionRepo.crearPedidosConOrdenesAgrupados({
        ordenes,
        fecha_entrega: fechaEntrega,
        id_usuario_creador: idUsuarioCreador
    });

    const idsPedido = [...new Set(ordenesCreadas.map((orden) => orden.id_pedido))];
    const pedidos = await pedidoFabricacionRepo.obtenerPedidosPorIds(idsPedido);

    const ordenesPorPedido = new Map(idsPedido.map((id) => [id, []]));
    ordenesCreadas.forEach((orden) => ordenesPorPedido.get(orden.id_pedido).push(orden));

    return {
        pedidos: pedidos.map((pedido) => ({
            pedido,
            ordenes: ordenesPorPedido.get(pedido.id_pedido)
        })),
        ordenes: ordenesCreadas
    };
};

export const aceptarPedido = async (idPedido) => {
    return await pedidoFabricacionRepo.aceptarPedido(idPedido);
};
