import { Router } from "express";
import { login, perfil, register, resetPassword, verificar } from "../controllers/auth.controller.js"; 
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { loginSchema, registerSchema, passwordResetSchema } from "../schemas/auth.schemas.js";
import { requirePermission } from "../middlewares/checkPermission.js";

// Importar register, verify, etc.

const router = Router();

router.post('/login',
    validateSchema(loginSchema), 
    login);

router.post('/register',
    validateSchema(registerSchema),
    requirePermission('crear_usuarios'),
    register);

router.get('/verificar', 
    verificarToken, 
    verificar);

router.get('/perfil', 
    verificarToken, 
    perfil);

router.post('/reset-password',
    verificarToken,
    requirePermission('reestablecer_contraseña'),
    validateSchema(passwordResetSchema),
    resetPassword
)

export default router;