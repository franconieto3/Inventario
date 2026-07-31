import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { actualizarGrafoProcesos, actualizarProceso, asignarRutaPieza, creacionProceso, eliminacionProceso, eliminarRutaPieza, listadoRutasFabricacion, listarProcesos, nuevoGrafoProcesos, obtenerGrafoProcesos, obtenerTiposProcesos, obtenerUnidadesTiempo, quitarRutaPieza } from "../controllers/process.controller.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { asociarRutaPiezasSchema, grafoSchema, procesoSchema } from "../schemas/process.schemas.js";
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

// --- GRAFOS DE PROCESOS --- //

//Creación
router.post('/ruta-procesos/new',
    verificarToken,
    requirePermission('crear_rutas_procesos'),
    validateSchema(grafoSchema),
    nuevoGrafoProcesos
)

//Proyección
router.get('/ruta-procesos/:id',
    verificarToken,
    requirePermission('ver_rutas_procesos'),
    obtenerGrafoProcesos
)

//Edición
router.put('/ruta-procesos/update/:id',
    verificarToken,
    requirePermission('editar_rutas_procesos'),
    actualizarGrafoProcesos

)

//Listado
router.get('/listado-rutas-fabricacion',
    verificarToken,
    requirePermission('ver_rutas_procesos'),
    listadoRutasFabricacion
)

//Asociar pieza
router.post('/ruta/asignacion-pieza',
    verificarToken,
    requirePermission('administrar_procesos_pieza'),
    validateSchema(asociarRutaPiezasSchema),
    asignarRutaPieza
);

//Desvincular pieza
router.delete('/ruta/desvinculacion/:idRuta/:idPieza',
    verificarToken,
    requirePermission('administrar_procesos_pieza'),
    eliminarRutaPieza
)

export default router;