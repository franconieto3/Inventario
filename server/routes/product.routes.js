import { Router } from "express";
import { rubros, registrosPM, productos, nuevoProducto, producto, pieza, agregarPieza, edicionPieza, eliminacionPieza, edicionProducto, eliminacionProducto} from '../controllers/product.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/rubros', verificarToken, rubros);
router.get('/registros-pm', verificarToken, registrosPM);
router.post('/new', verificarToken, nuevoProducto);
router.get('/',verificarToken, productos);
router.get('/:id',verificarToken, producto);
router.put('/edicion/:id', verificarToken, edicionProducto);
router.delete('/eliminacion/:id', verificarToken, eliminacionProducto);

router.get('/pieza/:id',verificarToken, pieza);
router.post('/pieza/crear', verificarToken, agregarPieza);
router.put('/pieza/edicion/:id', verificarToken, edicionPieza);
router.delete('/pieza/eliminacion/:id', verificarToken, eliminacionPieza);

export default router;
