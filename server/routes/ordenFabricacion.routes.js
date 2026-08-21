import { Router } from "express";
import { crearOrdenesMasivo } from "../controllers/ordenFabricacion.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { requirePermission } from "../middlewares/checkPermission.js";
import { ordenesFabricacionBulkSchema } from "../schemas/ordenFabricacion.schemas.js";

const router = Router();

router.post('/bulk',
    verificarToken,
    requirePermission('crear_ordenes_fabricacion'),
    validateSchema(ordenesFabricacionBulkSchema),
    crearOrdenesMasivo);

export default router;
