import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { actualizarProceso, actualizarRutaProcesos, creacionProceso, eliminacionProceso, eliminacionRuta, listadoRutas, listarProcesos, nuevaRutaProcesos, obtenerRuta, obtenerTiposProcesos, obtenerUnidadesTiempo, quitarRutaPieza } from "../controllers/process.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { procesoSchema } from "../schemas/process.schemas.js";
import { requirePermission } from "../middlewares/checkPermission.js";

const router = Router();

//Datos auxiliares 

router.get('/tipos', verificarToken, obtenerTiposProcesos);
router.get('/unidades', verificarToken, obtenerUnidadesTiempo);

//CRUD de procesos

router.get('/listado',
    verificarToken,
    requirePermission('ver_procesos'),
    listarProcesos
);

router.post('/new', 
    verificarToken,
    requirePermission('crear_proceso'), 
    validateSchema(procesoSchema),
    creacionProceso
);

router.put('/edicion/:id',
    verificarToken,
    requirePermission('editar_proceso'),
    validateSchema(procesoSchema),
    actualizarProceso
);

router.delete('/delete/:id',
    verificarToken,
    requirePermission('eliminar_procesos'),
    eliminacionProceso
);

//CRUD de rutas

router.post('/ruta/pieza',
    verificarToken,
    requirePermission('administrar_procesos_pieza'),
    requirePermission('crear_rutas_procesos'),
    //Esquema de validación
    nuevaRutaProcesos
);

router.get('/ruta/listado',
    verificarToken,
    requirePermission('ver_rutas_procesos'),
    listadoRutas
);

router.get('/ruta/:id',
    verificarToken,
    requirePermission('ver_rutas_procesos'),
    obtenerRuta
);

router.put('/ruta/update/:id',
    verificarToken,
    requirePermission('editar_rutas_procesos'),
    actualizarRutaProcesos
)

router.delete('/ruta/delete/:id',
    verificarToken,
    requirePermission('eliminar_rutas_procesos'),
    eliminacionRuta
)

router.delete('/ruta/pieza',
    verificarToken,
    requirePermission('administrar_procesos_pieza'),
    quitarRutaPieza
)


export default router;