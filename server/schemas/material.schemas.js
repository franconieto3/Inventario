import{z} from 'zod'

export const materialPayloadSchema = z.object({

  id_rubro_material: z.coerce.number().positive().int("Debe ser un número entero"),
  id_unidad_medida: z.coerce.number().positive().int("Debe ser un número entero"),
  descripcion: z.string().min(1, "La descripción es requerida y no puede estar vacía"),
  es_trazable: z.boolean().optional().default(false),
  atributos: z.record(z.string(), z.unknown()).optional().nullable(),
});
