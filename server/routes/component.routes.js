import { Router } from "express";
import { requirePermission } from "../middlewares/checkPermission.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { asociarPiezas, edicionComponente, eliminacionComponente } from "../controllers/component.controller.js";
import { crearComposicionSchema, editarComposicionSchema } from "../schemas/component.schemas.js";

const router = Router();

//Creación
router.post('/new', 
    verificarToken, 
    validateSchema(crearComposicionSchema),
    requirePermission('administrar_productos'),
    asociarPiezas
);

// Edición
router.put('/edit',
    verificarToken,
    validateSchema(editarComposicionSchema),
    requirePermission('administrar_productos'),
    edicionComponente
)

//Eliminación
router.delete('/remove',
    verificarToken,
    requirePermission('administrar_productos'),
    eliminacionComponente
);

export default router;