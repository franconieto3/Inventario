import { Router } from "express";
import { crearPedido, aceptarPedido } from "../controllers/pedidoFabricacion.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { requirePermission } from "../middlewares/checkPermission.js";
import { crearPedidoSchema } from "../schemas/pedidoFabricacion.schemas.js";

const router = Router();

router.post('/',
    verificarToken,
    requirePermission('crear_ordenes_fabricacion'),
    validateSchema(crearPedidoSchema),
    crearPedido);

router.patch('/:id/aceptar',
    verificarToken,
    requirePermission('aceptar_pedido_fabricacion'),
    aceptarPedido);

export default router;
