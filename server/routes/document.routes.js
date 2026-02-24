import { Router } from "express";
import {subirDocumento, documento, visualizarDocumento, historialDocumentos, tiposDocumento, reestablecerVersion, eliminacionVersion, solicitudCambio, solicitudesCambio, solicitudTerminada} from '../controllers/document.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { actualizarSolicitudSchema, DocumentoPayloadSchema, eliminarVersionSchema, HistorialVersionesSchema, ReestablecerVersionSchema, solicitudCambioSchema, SolicitudSubidaSchema, VisualizarDocumentoSchema } from "../schemas/document.schemas.js";
import { requirePermission } from "../middlewares/checkPermission.js";

const router = Router();

router.get('/tipo-documento', 
    verificarToken, 
    tiposDocumento);

router.post('/subir-plano', 
    verificarToken, 
    requirePermission('administrar_documentos'), 
    validateSchema(SolicitudSubidaSchema), 
    subirDocumento);

router.post('/guardar-documento', 
    verificarToken,
    requirePermission('administrar_documentos') ,
    validateSchema(DocumentoPayloadSchema), 
    documento);

router.get('/obtener-url-documento', 
    verificarToken,
    validateSchema(VisualizarDocumentoSchema,'query'), 
    visualizarDocumento);

router.get('/historial-versiones-pieza', 
    verificarToken, 
    validateSchema(HistorialVersionesSchema, 'query'), 
    historialDocumentos);

router.post('/recuperar-version', 
    verificarToken,
    requirePermission('administrar_documentos'), 
    validateSchema(ReestablecerVersionSchema), 
    reestablecerVersion);

router.delete('/eliminar/:id', 
    verificarToken,
    requirePermission('administrar_documentos'),
    validateSchema(eliminarVersionSchema, 'params'), 
    eliminacionVersion);

router.post('/nueva-solicitud',
	verificarToken,
	requirePermission('solicitar_modificacion'),
	validateSchema(solicitudCambioSchema),
	solicitudCambio);

router.get('/solicitud-cambio',
    verificarToken,
    requirePermission('solicitar_modificacion'),
    solicitudesCambio);

router.post('/actualizacion-solicitud',
    verificarToken,
    requirePermission('modificar_solicitud_cambio'),
    validateSchema(actualizarSolicitudSchema),
    solicitudTerminada);

export default router;
