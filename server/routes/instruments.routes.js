import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { instrumentos, nuevoInstrumento, sectores } from "../controllers/instruments.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { crearInstrumentoSchema } from "../schemas/instruments.schemas.js";

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

export default router;