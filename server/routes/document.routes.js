import { Router } from "express";
import {subirDocumento, documento, visualizarDocumento, historialDocumentos, tiposDocumento} from '../controllers/document.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/subir-plano', verificarToken, subirDocumento);
router.post('/guardar-documento', verificarToken, documento);
router.post('/obtener-url-plano', verificarToken, visualizarDocumento);
router.get('/historial-versiones-pieza', verificarToken, historialDocumentos);
router.get('/tipo-documento', verificarToken, tiposDocumento);

export default router;
