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

export const actualizarOrdenSchema = z.object({
  id_ruta: z.coerce.number({ invalid_type_error: "ID de ruta inválido" }).int().positive().optional(),
  id_materia_prima: z.string().trim().min(1, "El identificador de materia prima no puede estar vacío").optional(),
  id_orden_produccion: z.string().trim().min(1, "El identificador de orden de producción no puede estar vacío").optional(),
  id_estado_of: z.coerce.number({ invalid_type_error: "ID de estado inválido" }).int().positive().optional()
}).refine(
  (obj) => Object.keys(obj).length > 0,
  { message: "Debe incluir al menos un campo a actualizar" }
);
