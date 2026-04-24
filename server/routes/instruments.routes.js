import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { actualizarInstrumento, agregarVerificacion, borrarInstrumento, categorias, guardarVerificacion, instrumento, instrumentos, nuevaCategoria, nuevoInstrumento, sectores } from "../controllers/instruments.controller.js";
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

router.get('/listado', 
    verificarToken,
    instrumentos
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
    agregarVerificacion
)

router.post('/guardar-verificacion/:id',
    verificarToken,
    guardarVerificacion
)

export default router;