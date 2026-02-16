import { Router } from "express";
import { login, register, verificar } from "../controllers/auth.controller.js"; 
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js";

// Importar register, verify, etc.

const router = Router();

router.post('/login',validateSchema(loginSchema), login);
router.post('/register',validateSchema(registerSchema) ,register);
router.get('/verificar', verificarToken, verificar);

export default router;