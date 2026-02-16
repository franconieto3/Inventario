import { Router } from "express";
import { rubros, registrosPM, productos, nuevoProducto, producto, pieza, agregarPieza, edicionPieza, eliminacionPieza, edicionProducto, eliminacionProducto} from '../controllers/product.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { crearPiezaSchema, editarPiezaSchema, editarProductoSchema, productoSchema } from "../schemas/product.schemas.js";

const router = Router();

router.get('/rubros', verificarToken, rubros);
router.get('/registros-pm', verificarToken, registrosPM);
router.get('/',verificarToken, productos);
router.post('/new', verificarToken, validateSchema(productoSchema),nuevoProducto);
router.get('/:id',verificarToken, producto);
router.put('/edicion/:id', verificarToken, validateSchema(editarProductoSchema), edicionProducto);
router.delete('/eliminacion/:id', verificarToken, eliminacionProducto);
router.get('/pieza/:id',verificarToken, pieza);
router.post('/pieza/crear', verificarToken, validateSchema(crearPiezaSchema), agregarPieza);
router.put('/pieza/edicion/:id', verificarToken, validateSchema(editarPiezaSchema) ,edicionPieza);
router.delete('/pieza/eliminacion/:id', verificarToken, eliminacionPieza);

export default router;
