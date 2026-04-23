import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { actualizarInstrumento, agregarVerificacion, borrarInstrumento, guardarVerificacion, instrumento, instrumentos, nuevoInstrumento, sectores } from "../controllers/instruments.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { crearInstrumentoSchema, editarInstrumentoSchema } from "../schemas/instruments.schemas.js";

const router = Router();

router.get('/sectores',
    verificarToken,
    sectores
)

router.post('/', 
    verificarToken,
    validateSchema(crearInstrumentoSchema),
    nuevoInstrumento
);

router.get('/listado', 
    verificarToken,
    instrumentos
)

router.put('/:id', 
    verificarToken,
    validateSchema(editarInstrumentoSchema),
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

router.post('/guardar-verificacion',
    verificarToken,
    guardarVerificacion
)

export default router;