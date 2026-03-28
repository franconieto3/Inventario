import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { actualizarProceso, actualizarRutaProcesos, creacionProceso, eliminacionProceso, eliminacionRuta, listadoRutas, listarProcesos, nuevaRutaProcesos, obtenerRuta, obtenerTiposProcesos, obtenerUnidadesTiempo } from "../controllers/process.controller.js";
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

router.put('/edicion/:id',
    verificarToken,
    validateSchema(actualizarProcesoSchema),
    actualizarProceso
);

router.delete('/delete/:id',
    verificarToken,
    eliminacionProceso
);

//CRUD de rutas

router.post('/ruta/pieza',
    verificarToken,
    nuevaRutaProcesos
);

router.get('/ruta/listado',
    verificarToken,
    listadoRutas
);

router.get('/ruta/:id',
    verificarToken,
    obtenerRuta
);

router.put('/ruta/update/:id',
    verificarToken,
    actualizarRutaProcesos
)

router.delete('/ruta/delete/:id',
    verificarToken,
    eliminacionRuta
)

export default router;