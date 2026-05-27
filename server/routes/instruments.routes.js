import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { actualizarInstrumento, agregarPiezaInstrumento, archivoTemporal, baja, borrarCategoria, borrarInstrumento, categorias, edicionCategoria, eliminarPiezaInstrumento, getArchivosPorInstrumento, getVerificacionesPorInstrumento, guardarArchivoInstrumento, guardarVerificacion, instrumento, instrumentos, nuevaCategoria, nuevoInstrumento, sectores } from "../controllers/instruments.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { archivoTemporalSchema, categoriaSchema, instrumentoSchema, guardarArchivoAuxiliarSchema, guardarVerificacionSchema, crearPiezaInstrumentoSchema, eliminarPiezaInstrumentoSchema} from "../schemas/instruments.schemas.js";
import { requirePermission } from "../middlewares/checkPermission.js";

const router = Router();

router.get('/sectores',
    verificarToken,
    sectores
)

//Categorías

router.post('/categoria',
    verificarToken,
    requirePermission('crear_categorias_instrumentos'),
    validateSchema(categoriaSchema),
    nuevaCategoria
)

router.put('/categoria/:id',
    verificarToken,
    requirePermission('editar_categorias_instrumentos'),
    validateSchema(categoriaSchema),
    edicionCategoria
)

router.delete('/categoria/:id',
    verificarToken,
    requirePermission('eliminar_categorias_instrumentos'),
    borrarCategoria
);

router.get('/categorias',
    verificarToken,
    requirePermission('ver_categorias_instrumentos'),
    categorias
)

//Instrumentos

router.post('/', 
    verificarToken,
    requirePermission('crear_instrumentos'),
    validateSchema(instrumentoSchema),
    nuevoInstrumento
);


router.get('/listado', 
    verificarToken,
    requirePermission('ver_instrumentos'),
    instrumentos
)

router.put('/baja/:id',
    verificarToken,
    requirePermission('eliminar_instrumentos'),
    baja
)

router.put('/:id', 
    verificarToken,
    requirePermission('editar_instrumentos'),
    validateSchema(instrumentoSchema),
    actualizarInstrumento
);

router.delete('/:id',
    verificarToken,
    requirePermission('eliminar_instrumentos'),
    borrarInstrumento
);

router.get('/detalle/:id',
    verificarToken,
    requirePermission('ver_instrumentos'),
    instrumento
)

//Verificaciones

router.post('/verificacion',
    verificarToken,
    requirePermission('administrar_calibraciones'),
    validateSchema(archivoTemporalSchema),
    archivoTemporal
)

router.post('/guardar-verificacion/:id',
    verificarToken,
    requirePermission('administrar_calibraciones'),
    validateSchema(guardarVerificacionSchema),
    guardarVerificacion
)

router.get('/:idInstrumento/verificaciones',
    verificarToken,
    requirePermission('ver_instrumentos'),
    getVerificacionesPorInstrumento
);

//Archivos auxiliares

router.post('/archivo-auxiliar',
    verificarToken,
    requirePermission('editar_instrumentos'),
    validateSchema(archivoTemporalSchema),
    archivoTemporal
)

router.post('/guardar-archivo-auxiliar/:id',
    verificarToken,
    requirePermission('editar_instrumentos'),
    validateSchema(guardarArchivoAuxiliarSchema),
    guardarArchivoInstrumento
)

router.get('/:idInstrumento/archivos',
    verificarToken,
    requirePermission('ver_instrumentos'),
    getArchivosPorInstrumento
);


//Asociación con piezas

router.post('/pieza-instrumento',
    verificarToken, 
    requirePermission('administrar_instrumento_pieza'),
    validateSchema(crearPiezaInstrumentoSchema), 
    agregarPiezaInstrumento
);

router.delete('/pieza-instrumento/:id_pieza/:id_categoria_instrumento',
    verificarToken,
    requirePermission('administrar_instrumento_pieza'),
    validateSchema(eliminarPiezaInstrumentoSchema, 'params'),
    eliminarPiezaInstrumento
);


export default router;