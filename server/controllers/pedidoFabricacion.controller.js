import * as pedidoFabricacionService from "../services/pedidoFabricacion.service.js";

export const crearPedido = async (req, res) => {
    try {
        const { id_producto, fecha_entrega, ordenes } = req.body;
        const idUsuarioCreador = req.usuario.id_usuario;

        const data = await pedidoFabricacionService.crearPedidoConOrdenes(
            id_producto,
            fecha_entrega,
            idUsuarioCreador,
            ordenes
        );

        res.status(201).json({
            message: "Pedido de fabricación creado exitosamente",
            pedido: data.pedido,
            ordenes: data.ordenes
        });

    } catch (err) {
        console.error("Error en crearPedido:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const aceptarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await pedidoFabricacionService.aceptarPedido(id);

        res.status(200).json({
            message: "Pedido de fabricación aceptado exitosamente",
            pedido: data
        });
    } catch (err) {
        console.error("Error en aceptarPedido:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};
