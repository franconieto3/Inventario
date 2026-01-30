import { obtenerHistorialVersiones, obtenerTiposDocumento } from "../services/document.service.js";
import { obtenerInfoPieza } from "../services/product.service.js";

const data = await obtenerTiposDocumento();
console.log(data);