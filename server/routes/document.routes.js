import { Router } from "express";
import {subirDocumento, documento, visualizarDocumento, historialDocumentos, tiposDocumento, reestablecerVersion, eliminacionVersion} from '../controllers/document.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { DocumentoPayloadSchema, eliminarVersionSchema, HistorialVersionesSchema, ReestablecerVersionSchema, SolicitudSubidaSchema, VisualizarDocumentoSchema } from "../schemas/document.schemas.js";

const router = Router();

router.get('/tipo-documento', verificarToken, tiposDocumento);
router.post('/subir-plano', verificarToken, validateSchema(SolicitudSubidaSchema), subirDocumento);
router.post('/guardar-documento', verificarToken, validateSchema(DocumentoPayloadSchema), documento);
router.get('/obtener-url-documento', verificarToken,validateSchema(VisualizarDocumentoSchema,'query'), visualizarDocumento);
router.get('/historial-versiones-pieza', verificarToken, validateSchema(HistorialVersionesSchema, 'query'), historialDocumentos);
router.post('/recuperar-version', verificarToken, validateSchema(ReestablecerVersionSchema), reestablecerVersion);
router.delete('/eliminar/:id', verificarToken,validateSchema(eliminarVersionSchema, 'params'), eliminacionVersion);

export default router;
