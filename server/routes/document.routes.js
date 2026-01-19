import { Router } from "express";
import {subirPlano, documento, visualizarPlano} from '../controllers/document.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/subir-plano', verificarToken, subirPlano);
router.post('/guardar-documento', verificarToken, documento);
router.post('/obtener-url-plano', verificarToken, visualizarPlano);

export default router;
