import * as pedidoFabricacionService from "../services/pedidoFabricacion.service.js";

export const crearPedido = async (req, res) => {
    try {
        const { fecha_entrega, ordenes } = req.body;
        const idUsuarioCreador = req.usuario.id_usuario;

        const data = await pedidoFabricacionService.crearPedidoConOrdenes(
            fecha_entrega,
            idUsuarioCreador,
            ordenes
        );

        res.status(201).json({
            message: "Pedido(s) de fabricación creado(s) exitosamente",
            pedidos: data.pedidos,
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

export const obtenerDetalle = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await pedidoFabricacionService.obtenerDetallePedido(id);
        res.status(200).json(data);
    } catch (err) {
        console.error("Error en obtenerDetalle:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const actualizarFechaEntrega = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_entrega } = req.body;

        const data = await pedidoFabricacionService.actualizarFechaEntrega(id, fecha_entrega);

        res.status(200).json({
            message: "Fecha de entrega actualizada exitosamente",
            pedido: data
        });
    } catch (err) {
        console.error("Error en actualizarFechaEntrega:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const imprimirPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const idUsuario = req.usuario.id_usuario;
        const data = await pedidoFabricacionService.registrarImpresion(id, idUsuario);

        res.status(201).json({
            message: "Impresión de pedido registrada exitosamente",
            impresion: data
        });
    } catch (err) {
        console.error("Error en imprimirPedido:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};
