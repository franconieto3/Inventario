import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { actualizarProceso, creacionProceso, listarProcesos, nuevaRutaProcesos, obtenerTiposProcesos, obtenerUnidadesTiempo } from "../controllers/process.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { actualizarProcesoSchema, crearProcesoSchema } from "../schemas/process.schemas.js";

const router = Router();

//Datos auxiliares 

router.get('/tipos', verificarToken, obtenerTiposProcesos);
router.get('/unidades', verificarToken, obtenerUnidadesTiempo);

//CRUD de procesos

router.get('/listado',
    verificarToken,
    listarProcesos
);

router.post('/new', 
    verificarToken, 
    validateSchema(crearProcesoSchema),
    creacionProceso
);

router.put('/edicion',
    verificarToken,
    validateSchema(actualizarProcesoSchema),
    actualizarProceso
);

router.post('/ruta/pieza',
    verificarToken,
    nuevaRutaProcesos
);

export default router;