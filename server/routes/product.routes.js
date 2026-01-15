import { Router } from "express";
import { rubros, registrosPM, productos, nuevoProducto, producto} from '../controllers/product.controller.js';
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get('/rubros', verificarToken, rubros);
router.get('/registros-pm', verificarToken, registrosPM);
router.post('/', verificarToken, nuevoProducto);
router.get('/',verificarToken, productos);
router.get('/:id',verificarToken, producto);

export default router;
