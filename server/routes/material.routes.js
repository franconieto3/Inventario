import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { asociarPieza, crearMaterial, edicionBom, eliminacionMaterial, listarMateriales, obtenerMaterialesSelector, obtenerRubros, obtenerUnidades, quitarMaterial, updateMaterial } from "../controllers/material.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { asociarPiezaSchema, materialPayloadSchema } from "../schemas/material.schemas.js";
import { requirePermission } from "../middlewares/checkPermission.js";

const router = Router();

router.get('/rubros', verificarToken, obtenerRubros);
router.get('/unidades', verificarToken, obtenerUnidades);

router.get('/listado', 
    verificarToken,
    requirePermission('ver_materiales_listado'), 
    listarMateriales);

router.post('/nuevo', 
    verificarToken, 
    requirePermission('crear_materiales'),
    validateSchema(materialPayloadSchema),
    crearMaterial
);

router.put('/edicion/:id',
    verificarToken, 
    requirePermission('editar_materiales'),
    validateSchema(materialPayloadSchema),
    updateMaterial
);

router.delete('/eliminacion/:id',
    verificarToken,
    requirePermission('eliminar_materiales'),
    eliminacionMaterial  
);


router.get('/selector', 
    verificarToken, 
    requirePermission('ver_materiales_listado'),
    obtenerMaterialesSelector
);

//Asociar con piezas

router.post('/bom-pieza',
    verificarToken,
    requirePermission('administrar_materiales_pieza'),
    validateSchema(asociarPiezaSchema),
    asociarPieza
)

router.delete('/remove', 
    verificarToken,
    requirePermission('administrar_materiales_pieza'),
    quitarMaterial
 )

 router.put('/bom',
    verificarToken,
    requirePermission('administrar_materiales_pieza'),
    edicionBom
  )

export default router;
