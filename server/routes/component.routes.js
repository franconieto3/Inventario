import { Router } from "express";
import { requirePermission } from "../middlewares/checkPermission.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { asociarPiezas, eliminacionComponente } from "../controllers/component.controller.js";
import { crearComposicionSchema } from "../schemas/component.schemas.js";

const router = Router();

//Creación
router.post('/new', 
    verificarToken, 
    validateSchema(crearComposicionSchema),
    //Permisos 
    asociarPiezas
);

// Edición


//Eliminación
router.delete('/delete',
    verificarToken,
    //Permisos
    eliminacionComponente
 )

export default router;