import { z } from "zod";

// Req. 12: cada orden del lote puede indicar, mediante id_padre_ref, la posición
// (0-based) de otra orden anterior del mismo lote de la cual es hija (sugerencia de
// composición ya aprobada por el supervisor). fn_crear_ordenes_fabricacion_masivo ya
// no explota composicion_pieza por su cuenta: crea exactamente lo que recibe.
const ordenItemSchema = z.object({
  id_pieza: z.coerce.number({ invalid_type_error: "ID de pieza inválido" }).int().positive(),
  cantidad: z.coerce.number({ invalid_type_error: "Cantidad inválida" }).int().positive(),
  a_medida: z.boolean().optional().default(false),
  id_padre_ref: z.coerce.number({ invalid_type_error: "Referencia de orden padre inválida" }).int().nonnegative().nullable().optional()
});

export const ordenesArraySchema = z.array(ordenItemSchema)
  .min(1, "Debe incluir al menos una orden")
  .superRefine((ordenes, ctx) => {
    ordenes.forEach((orden, index) => {
      if (orden.id_padre_ref != null && orden.id_padre_ref >= index) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `id_padre_ref en la posición ${index} debe referenciar una orden anterior del mismo lote.`,
          path: [index, "id_padre_ref"]
        });
      }
    });
  });

export const ordenesFabricacionBulkSchema = z.object({
  ordenes: ordenesArraySchema
});

export const sugerenciasComposicionSchema = z.object({
  piezas: z.array(
    z.object({
      id_pieza: z.coerce.number({ invalid_type_error: "ID de pieza inválido" }).int().positive(),
      cantidad: z.coerce.number({ invalid_type_error: "Cantidad inválida" }).int().positive()
    })
  ).min(1, "Debe incluir al menos una pieza")
});

export const actualizarOrdenSchema = z.object({
  id_ruta: z.coerce.number({ invalid_type_error: "ID de ruta inválido" }).int().positive().optional(),
  materiales_aprobados: z.boolean({ invalid_type_error: "El valor de aprobación de materiales es inválido" }).optional(),
  id_orden_produccion: z.string().trim().min(1, "El identificador de orden de producción no puede estar vacío").optional(),
  id_estado_of: z.coerce.number({ invalid_type_error: "ID de estado inválido" }).int().positive().optional()
}).refine(
  (obj) => Object.keys(obj).length > 0,
  { message: "Debe incluir al menos un campo a actualizar" }
);

export const materiaPrimaSchema = z.object({
  identificador: z.string().trim().min(1, "El identificador de materia prima no puede estar vacío")
});
