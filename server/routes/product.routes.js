import { Router } from "express";
import { rubros, registrosPM, productos, nuevoProducto, producto, pieza, agregarPieza, edicionPieza, eliminacionPieza, edicionProducto, eliminacionProducto, piezas} from '../controllers/product.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";

import { crearPiezaSchema, editarPiezaSchema, editarProductoSchema, productoSchema } from "../schemas/product.schemas.js";
import { requirePermission } from "../middlewares/checkPermission.js";

const router = Router();

router.get('/rubros', 
    verificarToken, 
    rubros);

router.get('/registros-pm', 
    verificarToken, 
    registrosPM);

router.get('/',
    verificarToken, 
    productos);

router.post('/new', 
    verificarToken, 
    requirePermission('administrar_productos'),
    validateSchema(productoSchema),
    nuevoProducto);

router.get('/:id',
    verificarToken, 
    producto);

router.put('/edicion/:id', 
    verificarToken, 
    requirePermission('administrar_productos'), 
    validateSchema(editarProductoSchema), 
    edicionProducto);

router.delete('/eliminacion/:id',
    verificarToken, 
    requirePermission('administrar_productos'),
    eliminacionProducto);

router.get('/pieza/:id',
    verificarToken, 
    pieza);

router.post('/pieza/crear', 
    verificarToken, 
    requirePermission('administrar_productos'),
    validateSchema(crearPiezaSchema), 
    agregarPieza);

router.put('/pieza/edicion/:id',
    verificarToken,
    requirePermission('administrar_productos'),
    validateSchema(editarPiezaSchema),
    edicionPieza);

router.delete('/pieza/eliminacion/:id', 
    verificarToken,
    requirePermission('administrar_productos'), 
    eliminacionPieza);

router.get('listado-piezas',
    verificarToken, 
    piezas);

export default router;
