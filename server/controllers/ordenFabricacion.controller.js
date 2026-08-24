import * as ordenFabricacionService from "../services/ordenFabricacion.service.js";

export const crearOrdenesMasivo = async (req, res) => {
    try {
        const { ordenes } = req.body;

        const data = await ordenFabricacionService.crearOrdenesMasivo(ordenes);

        res.status(201).json({
            message: "Órdenes de fabricación creadas exitosamente",
            ordenes: data
        });

    } catch (err) {
        console.error("Error en crearOrdenesMasivo:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const obtenerPendientesDiseno = async (req, res) => {
    try {
        const data = await ordenFabricacionService.listarPendientesDiseno();
        res.status(200).json(data);
    } catch (err) {
        console.error("Error en obtenerPendientesDiseno:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const obtenerPendientesMateriales = async (req, res) => {
    try {
        const data = await ordenFabricacionService.listarPendientesMateriales();
        res.status(200).json(data);
    } catch (err) {
        console.error("Error en obtenerPendientesMateriales:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const obtenerActivas = async (req, res) => {
    try {
        const data = await ordenFabricacionService.listarActivas();
        res.status(200).json(data);
    } catch (err) {
        console.error("Error en obtenerActivas:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const obtenerRutasPieza = async (req, res) => {
    try {
        const { idPieza } = req.params;
        const data = await ordenFabricacionService.obtenerRutasPieza(idPieza);
        res.status(200).json(data);
    } catch (err) {
        console.error("Error en obtenerRutasPieza:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const actualizarOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await ordenFabricacionService.actualizarOrden(id, req.body);

        res.status(200).json({
            message: "Orden de fabricación actualizada exitosamente",
            orden: data
        });
    } catch (err) {
        console.error("Error en actualizarOrden:", err);
        res.status(err.statusCode || 500).json({ error: err.message });
    }
};
