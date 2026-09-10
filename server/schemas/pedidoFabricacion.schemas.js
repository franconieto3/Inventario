import { z } from "zod";
import { ordenesArraySchema } from "./ordenFabricacion.schemas.js";

// La fecha de entrega es opcional: "" / null / undefined se normalizan a undefined antes
// de coercionar, para no confundir un campo vacío con una fecha inválida.
const fechaEntregaSchema = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.coerce.date({ invalid_type_error: "Fecha de entrega inválida" }).optional()
);

export const crearPedidoSchema = z.object({
  fecha_entrega: fechaEntregaSchema,
  ordenes: ordenesArraySchema
});

export const actualizarFechaEntregaSchema = z.object({
  fecha_entrega: fechaEntregaSchema
});
