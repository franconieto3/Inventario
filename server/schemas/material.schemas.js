import{z} from 'zod'

export const materialPayloadSchema = z.object({

  id_rubro_material: z.coerce.number().positive().int("Debe ser un número entero"),
  id_unidad_medida: z.coerce.number().positive().int("Debe ser un número entero"),
  descripcion: z.string().min(1, "La descripción es requerida y no puede estar vacía"),
  es_trazable: z.boolean().optional().default(false),
  atributos: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const asociarPiezaSchema = z.object({
  idPieza: z.coerce.number({
    required_error: 'El ID de la pieza es requerido',
    invalid_type_error: 'El ID de la pieza debe ser un número entero',
  }).int().positive('El ID de la pieza debe ser un número positivo'),
  
  materiales: z.array(
    z.object({
      id_material: z.number({
        required_error: 'El ID del material es requerido',
        invalid_type_error: 'El ID del material debe ser un número',
      }).int().positive('El ID del material debe ser un número positivo'),
      
      consumo: z.number({
        required_error: 'El consumo teórico es requerido',
        invalid_type_error: 'El consumo debe ser un número',
      }).positive('El consumo debe ser mayor a 0')
    })
  ).min(1, 'Debe asociar al menos un material a la pieza')
});
