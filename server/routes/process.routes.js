import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { listarProcesos, obtenerTiposProcesos, obtenerUnidadesTiempo } from "../controllers/process.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";

const router = Router();

router.get('/tipos', verificarToken, obtenerTiposProcesos);
router.get('/unidades', verificarToken, obtenerUnidadesTiempo);

router.get('/listado',
    verificarToken,
    listarProcesos
);

export default router;