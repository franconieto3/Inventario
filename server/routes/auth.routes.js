import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js"; 
// Importar register, verify, etc.

const router = Router();

router.post('/login', login);
router.post('/register', register);
// router.get('/verificar', verificarToken, verify);

export default router;