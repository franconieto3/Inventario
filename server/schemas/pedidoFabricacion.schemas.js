import { z } from "zod";
import { ordenesArraySchema } from "./ordenFabricacion.schemas.js";

export const crearPedidoSchema = z.object({
  fecha_entrega: z.coerce.date({ invalid_type_error: "Fecha de entrega inválida" }),
  ordenes: ordenesArraySchema
});
