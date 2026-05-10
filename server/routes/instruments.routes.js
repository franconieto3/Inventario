import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { actualizarInstrumento, agregarPiezaInstrumento, archivoTemporal, baja, borrarCategoria, borrarInstrumento, categorias, edicionCategoria, eliminarPiezaInstrumento, getArchivosPorInstrumento, getVerificacionesPorInstrumento, guardarArchivoInstrumento, guardarVerificacion, instrumento, instrumentos, nuevaCategoria, nuevoInstrumento, sectores } from "../controllers/instruments.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { archivoTemporalSchema, categoriaSchema, instrumentoSchema, guardarArchivoAuxiliarSchema, guardarVerificacionSchema, crearPiezaInstrumentoSchema, eliminarPiezaInstrumentoSchema} from "../schemas/instruments.schemas.js";

const router = Router();

router.get('/sectores',
    verificarToken,
    sectores
)

//Categorías

router.post('/categoria',
    verificarToken,
    validateSchema(categoriaSchema),
    nuevaCategoria
)

router.put('/categoria/:id',
    verificarToken,
    validateSchema(categoriaSchema),
    edicionCategoria
)

router.delete('/categoria/:id',
    verificarToken,
    borrarCategoria
);

router.get('/categorias',
    verificarToken,
    categorias
)

//Instrumentos

router.post('/', 
    verificarToken,
    validateSchema(instrumentoSchema),
    nuevoInstrumento
);


router.get('/listado', 
    verificarToken,
    instrumentos
)

router.put('/baja/:id',
    verificarToken,
    baja
)

router.put('/:id', 
    verificarToken,
    validateSchema(instrumentoSchema),
    actualizarInstrumento
);

router.delete('/:id',
    verificarToken,
    borrarInstrumento
);

router.get('/detalle/:id',
    verificarToken,
    instrumento
)

//Verificaciones

router.post('/verificacion',
    verificarToken,
    validateSchema(archivoTemporalSchema),
    archivoTemporal
)

router.post('/guardar-verificacion/:id',
    verificarToken,
    validateSchema(guardarVerificacionSchema),
    guardarVerificacion
)

router.get('/:idInstrumento/verificaciones',
    verificarToken,
    getVerificacionesPorInstrumento
);

//Archivos auxiliares

router.post('/archivo-auxiliar',
    verificarToken,
    validateSchema(archivoTemporalSchema),
    archivoTemporal
)

router.post('/guardar-archivo-auxiliar/:id',
    verificarToken,
    validateSchema(guardarArchivoAuxiliarSchema),
    guardarArchivoInstrumento
)

router.get('/:idInstrumento/archivos',
    verificarToken,
    getArchivosPorInstrumento
);

//Asociación con piezas

router.post(
    '/pieza-instrumento', 
    validateSchema(crearPiezaInstrumentoSchema), 
    agregarPiezaInstrumento
);

router.delete(
    '/pieza-instrumento/:id_pieza/:id_categoria_instrumento',
    validateSchema(eliminarPiezaInstrumentoSchema, 'params'),
    eliminarPiezaInstrumento
);


export default router;