import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { administrarRoles, administrarSectores, baja, crearRol, editarRol, editarUsuario, eliminarRol, permisos, roles, usuarios } from "../controllers/user.controller.js";

const router = Router();

//Usuarios

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

//Permisos

router.get('/permisos/listado',
    verificarToken,
    permisos
)

//Roles

router.get('/roles/listado',
    verificarToken,
    roles
)

router.post('/rol',
    verificarToken,
    crearRol
)

router.put('/rol/:id',
    verificarToken,
    editarRol
)

router.delete('/rol/:id',
    verificarToken,
    eliminarRol
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
