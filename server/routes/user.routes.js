import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { administrarRoles, permisos, roles, usuarios } from "../controllers/user.controller.js";

const router = Router();

router.get('/listado',
    verificarToken,
    usuarios
);

router.get('/listado',
    verificarToken,
    usuarios
)
router.get('/permisos/listado',
    verificarToken,
    permisos
)

router.get('/roles/listado',
    verificarToken,
    roles
)

router.post('/:id/roles',
    verificarToken,
    administrarRoles
);

export default router;
