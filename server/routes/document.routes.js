import { Router } from "express";
import {subirDocumento, documento, visualizarDocumento} from '../controllers/document.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/subir-plano', verificarToken, subirDocumento);
router.post('/guardar-documento', verificarToken, documento);
router.post('/obtener-url-plano', verificarToken, visualizarDocumento);

export default router;
