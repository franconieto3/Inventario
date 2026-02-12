import { Router } from "express";
import {subirDocumento, documento, visualizarDocumento, historialDocumentos, tiposDocumento, reestablecerVersion, eliminacionVersion} from '../controllers/document.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/subir-plano', verificarToken, subirDocumento);
router.post('/guardar-documento', verificarToken, documento);
router.post('/obtener-url-plano', verificarToken, visualizarDocumento);
router.get('/historial-versiones-pieza', verificarToken, historialDocumentos);
router.get('/tipo-documento', verificarToken, tiposDocumento);
router.post('/recuperar-version', verificarToken, reestablecerVersion);
router.delete('/eliminar/:id', verificarToken, eliminacionVersion);

export default router;
