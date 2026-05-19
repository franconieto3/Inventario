import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { administrarRoles, administrarSectores, baja, editarUsuario, permisos, roles, usuarios } from "../controllers/user.controller.js";

const router = Router();

router.get('/listado',
    verificarToken,
    usuarios
);

router.put('/:id/edit',
    verificarToken,
    editarUsuario
)

router.put('baja/:id',
    verificarToken,
    baja
)

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

router.post('/:id/sectores',
    verificarToken,
    administrarSectores
)

export default router;
