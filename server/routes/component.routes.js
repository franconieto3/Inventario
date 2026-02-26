import { Router } from "express";
import { requirePermission } from "../middlewares/checkPermission.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { asociarPiezas } from "../controllers/component.controller.js";
import { crearComposicionSchema } from "../schemas/component.schemas.js";

const router = Router();

router.post('/new', 
    verificarToken, 
    validateSchema(crearComposicionSchema), 
    asociarPiezas
);

export default router;