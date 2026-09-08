import { Router } from "express";
import { crearPedido, aceptarPedido, obtenerDetalle, imprimirPedido } from "../controllers/pedidoFabricacion.controller.js";
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

// Req. 15: cualquier usuario autenticado puede ver el detalle del pedido (al escanear el
// QR o navegar directo), sin permiso adicional.
router.get('/:id',
    verificarToken,
    obtenerDetalle);

router.post('/:id/imprimir',
    verificarToken,
    requirePermission('imprimir_pedido_fabricacion'),
    imprimirPedido);

export default router;
