import { getSectores } from "../services/sectors.service.js";


export const sectores = async (req, res) => {
    try {
      const sectores = await getSectores();
      return res.status(200).json(sectores);
    } catch (error) {
      console.error('[InstrumentosController.getSectores]', error);
      return res.status(500).json({ error: 'Error interno del servidor al cargar sectores' });
    }
}