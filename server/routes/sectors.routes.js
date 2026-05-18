import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { sectores } from "../controllers/sectors.controller.js";

const router = Router();

router.get('/listado',
    verificarToken,
    sectores
)

export default router;