import { Router } from "express";
import { rubros } from '../controllers/product.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/rubros', verificarToken, rubros);

export default router;
