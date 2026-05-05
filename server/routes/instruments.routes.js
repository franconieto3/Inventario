import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { actualizarInstrumento, archivoTemporal, baja, borrarCategoria, borrarInstrumento, categorias, edicionCategoria, getArchivosPorInstrumento, getVerificacionesPorInstrumento, guardarArchivoInstrumento, guardarVerificacion, instrumento, instrumentos, nuevaCategoria, nuevoInstrumento, sectores } from "../controllers/instruments.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { crearInstrumentoSchema, editarInstrumentoSchema } from "../schemas/instruments.schemas.js";

const router = Router();

router.get('/sectores',
    verificarToken,
    sectores
)

router.post('/', 
    verificarToken,
    //validateSchema(crearInstrumentoSchema),
    nuevoInstrumento
);

router.post('/categoria',
    verificarToken,
    nuevaCategoria
)

router.put('/categoria/:id',
    verificarToken,
    edicionCategoria
)

router.delete('/categoria/:id',
    verificarToken,
    borrarCategoria
);

router.get('/listado', 
    verificarToken,
    instrumentos
)

router.put('/baja/:id',
    verificarToken,
    baja
)

router.get('/categorias',
    verificarToken,
    categorias
)

router.put('/:id', 
    verificarToken,
    //validateSchema(editarInstrumentoSchema),
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
    archivoTemporal
)

router.post('/guardar-verificacion/:id',
    verificarToken,
    guardarVerificacion
)

router.get('/:idInstrumento/verificaciones',
    verificarToken,
    getVerificacionesPorInstrumento
);

//Archivos auxiliares

router.post('/archivo-auxiliar',
    verificarToken,
    archivoTemporal
)

router.post('/guardar-archivo-auxiliar/:id',
    verificarToken,
    guardarArchivoInstrumento
)

router.get('/:idInstrumento/archivos',
    verificarToken,
    getArchivosPorInstrumento
);

export default router;