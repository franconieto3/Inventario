import { Router } from "express";
import { login, register, verificar } from "../controllers/auth.controller.js"; 
import { verificarToken } from "../middlewares/auth.middleware.js";

// Importar register, verify, etc.

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/verificar', verificarToken, verificar);

export default router;