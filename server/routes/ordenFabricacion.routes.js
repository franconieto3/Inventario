import { Router } from "express";
import {
    crearOrdenesMasivo,
    obtenerPendientesDiseno,
    obtenerPendientesMateriales,
    obtenerActivas,
    obtenerRutasPieza,
    actualizarOrden
} from "../controllers/ordenFabricacion.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { requirePermission, requireAnyPermission } from "../middlewares/checkPermission.js";
import { ordenesFabricacionBulkSchema, actualizarOrdenSchema } from "../schemas/ordenFabricacion.schemas.js";

const router = Router();

router.post('/bulk',
    verificarToken,
    requirePermission('crear_ordenes_fabricacion'),
    validateSchema(ordenesFabricacionBulkSchema),
    crearOrdenesMasivo);

router.get('/pendientes-diseno',
    verificarToken,
    requirePermission('acceso_ingenieria'),
    obtenerPendientesDiseno);

router.get('/pendientes-materiales',
    verificarToken,
    requirePermission('acceso_materiales'),
    obtenerPendientesMateriales);

router.get('/activas',
    verificarToken,
    requirePermission('acceso_supervision'),
    obtenerActivas);

router.get('/rutas-pieza/:idPieza',
    verificarToken,
    requirePermission('acceso_ingenieria'),
    obtenerRutasPieza);

router.patch('/:id',
    verificarToken,
    requireAnyPermission(['acceso_ingenieria', 'acceso_materiales', 'acceso_supervision']),
    validateSchema(actualizarOrdenSchema),
    actualizarOrden);

export default router;
