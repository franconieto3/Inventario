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

export default router;