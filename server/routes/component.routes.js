import { Router } from "express";
import { requirePermission } from "../middlewares/checkPermission.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { asociarPiezas, asociarPiezasBulk, edicionComponente, eliminacionComponente } from "../controllers/component.controller.js";
import { asociarComposicionBulkSchema, crearComposicionSchema, editarComposicionSchema } from "../schemas/component.schemas.js";

const router = Router();

//Creación
router.post('/new', 
    verificarToken, 
    requirePermission('administrar_componentes_pieza'),
    validateSchema(crearComposicionSchema),
    asociarPiezas
);

// Edición
router.put('/edit',
    verificarToken,
    requirePermission('administrar_componentes_pieza'),
    validateSchema(editarComposicionSchema),
    edicionComponente
)

//Eliminación
router.delete('/remove',
    verificarToken,
    requirePermission('administrar_componentes_pieza'),
    eliminacionComponente
);

//Asociación múltiple de componentes
router.post('/bulk-load',
    verificarToken,
    requirePermission('administrar_componentes_pieza'),
    validateSchema(asociarComposicionBulkSchema),
    asociarPiezasBulk
);

export default router;