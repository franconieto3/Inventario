import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { crearMaterial, eliminacionMaterial, listarMateriales, obtenerRubros, obtenerUnidades, updateMaterial } from "../controllers/material.controller.js";
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

router.put('/edicion/:id',
    verificarToken, 
    validateSchema(materialPayloadSchema),
    updateMaterial);

router.delete('/eliminacion/:id',
    verificarToken,
    eliminacionMaterial  
)
export default router;