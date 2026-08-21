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
