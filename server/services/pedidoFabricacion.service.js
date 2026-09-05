import * as pedidoFabricacionRepo from "../repositories/pedidoFabricacion.repositories.js";
import * as ordenFabricacionService from "./ordenFabricacion.service.js";

export const crearPedidoConOrdenes = async (idProducto, fechaEntrega, idUsuarioCreador, ordenes) => {
    const pedido = await pedidoFabricacionRepo.crearPedido({
        id_producto: idProducto,
        fecha_entrega: fechaEntrega,
        id_usuario_creador: idUsuarioCreador
    });

    let ordenesCreadas;
    try {
        ordenesCreadas = await ordenFabricacionService.crearOrdenesMasivo(ordenes);
    } catch (err) {
        await pedidoFabricacionRepo.eliminarPedido(pedido.id_pedido);
        throw err;
    }

    const idsOf = ordenesCreadas.map((orden) => orden.id_of);
    await pedidoFabricacionRepo.asignarPedidoAOrdenes(idsOf, pedido.id_pedido);

    // crearOrdenesMasivo devuelve las órdenes tal como quedaron antes de asignarles
    // el pedido (paso siguiente); se completa acá para que la respuesta sea consistente
    // con lo que después devuelve el listado de "activas".
    const ordenesConPedido = ordenesCreadas.map((orden) => ({
        ...orden,
        id_pedido: pedido.id_pedido,
        pedido_fabricacion: {
            id_pedido: pedido.id_pedido,
            fecha_entrega: pedido.fecha_entrega,
            id_estado_pedido: pedido.id_estado_pedido
        }
    }));

    return { pedido, ordenes: ordenesConPedido };
};

export const aceptarPedido = async (idPedido) => {
    return await pedidoFabricacionRepo.aceptarPedido(idPedido);
};
