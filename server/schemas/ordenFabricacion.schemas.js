import { z } from "zod";

export const ordenesFabricacionBulkSchema = z.object({
  ordenes: z.array(
    z.object({
      id_pieza: z.coerce.number({ invalid_type_error: "ID de pieza inválido" }).int().positive(),
      cantidad: z.coerce.number({ invalid_type_error: "Cantidad inválida" }).int().positive(),
      a_medida: z.boolean().optional().default(false)
    })
  ).min(1, "Debe incluir al menos una orden")
});
