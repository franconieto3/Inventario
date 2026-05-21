import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { administrarRoles, administrarSectores, baja, crearRol, editarRol, editarUsuario, eliminarRol, permisos, roles, usuarios } from "../controllers/user.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { administrarRolesSchema, administrarSectoresSchema, bajaUsuarioSchema, crearRolSchema, editarRolSchema, editarUsuarioSchema, idParamSchema } from "../schemas/user.schemas.js";
import { requirePermission } from "../middlewares/checkPermission.js";

const router = Router();

//Usuarios

router.get('/listado',
    verificarToken,
    requirePermission('ver_usuarios'),
    usuarios
);

router.put('/:id/edit',
    verificarToken,
    requirePermission('administrar_usuarios'),
    validateSchema(idParamSchema,'params'),
    validateSchema(editarUsuarioSchema),
    editarUsuario
)

router.put('/baja/:id',
    verificarToken,
    requirePermission('baja_usuarios'),
    validateSchema(idParamSchema,'params'),
    validateSchema(bajaUsuarioSchema),
    baja
)

//Permisos

router.get('/permisos/listado',
    verificarToken,
    requirePermission('ver_permisos'),
    permisos
)

//Roles

router.get('/roles/listado',
    verificarToken,
    requirePermission('ver_roles'),
    roles
)

router.post('/rol',
    verificarToken,
    requirePermission('crear_roles'),
    validateSchema(crearRolSchema),
    crearRol
)

router.put('/rol/:id',
    verificarToken,
    requirePermission('editar_roles'),
    validateSchema(idParamSchema,'params'),
    validateSchema(editarRolSchema),
    editarRol
)

router.delete('/rol/:id',
    verificarToken,
    requirePermission('eliminar_roles'),
    validateSchema(idParamSchema,'params'),
    eliminarRol
)


router.post('/:id/roles',
    verificarToken,
    requirePermission('administrar_roles_usuario'),
    validateSchema(idParamSchema,'params'),
    validateSchema(administrarRolesSchema),
    administrarRoles
);

router.post('/:id/sectores',
    verificarToken,
    requirePermission('administrar_sectores_usuario'),
    validateSchema(idParamSchema,'params'),
    validateSchema(administrarSectoresSchema),
    administrarSectores
)

export default router;
