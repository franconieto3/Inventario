import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { crearMaterial, listarMateriales, obtenerRubros, obtenerUnidades } from "../controllers/material.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { materialPayloadSchema } from "../schemas/material.schemas.js";

const router = Router();

router.get('/rubros', verificarToken, obtenerRubros);
router.get('/unidades', verificarToken, obtenerUnidades);
router.get('/listado', verificarToken, listarMateriales);

router.post('/nuevo', 
    verificarToken, 
    validateSchema(materialPayloadSchema),
    crearMaterial);

export default router;