import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { asociarPieza, crearMaterial, eliminacionMaterial, listarMateriales, obtenerMaterialesSelector, obtenerRubros, obtenerUnidades, updateMaterial } from "../controllers/material.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { asociarPiezaSchema, materialPayloadSchema } from "../schemas/material.schemas.js";

const router = Router();

router.get('/rubros', verificarToken, obtenerRubros);
router.get('/unidades', verificarToken, obtenerUnidades);
router.get('/listado', verificarToken, listarMateriales);

router.post('/nuevo', 
    verificarToken, 
    validateSchema(materialPayloadSchema),
    crearMaterial
);

router.put('/edicion/:id',
    verificarToken, 
    validateSchema(materialPayloadSchema),
    updateMaterial
);

router.delete('/eliminacion/:id',
    verificarToken,
    eliminacionMaterial  
);


router.get('/selector', 
    verificarToken, 
    obtenerMaterialesSelector
);
    
router.post('/bom-pieza',
    verificarToken,
    validateSchema(asociarPiezaSchema),
    asociarPieza
)


export default router;
