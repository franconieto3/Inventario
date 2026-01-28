import { obtenerInfoPieza } from "../services/product.service.js";

const data = await obtenerInfoPieza(2);
console.log(data);