import { Router } from "express";
import { rubros, registrosPM, productos, nuevoProducto, producto, pieza, agregarPieza} from '../controllers/product.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/rubros', verificarToken, rubros);
router.get('/registros-pm', verificarToken, registrosPM);
router.post('/new', verificarToken, nuevoProducto);
router.get('/',verificarToken, productos);
router.get('/:id',verificarToken, producto);

router.get('/pieza/:id',verificarToken, pieza);
router.post('/pieza/crear', verificarToken, agregarPieza);

export default router;
