import { z } from "zod";


const UNIDADES_TIEMPO = ["segundos", "minutos", "horas", "dias", "semanas", "meses"]; 

export const crearProcesoSchema = z.object({
  nombre: z
    .string({
      required_error: "El nombre del proceso es obligatorio",
      invalid_type_error: "El nombre debe ser un texto",
    })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre es demasiado largo" }),

  id_tipo_proceso: z.coerce
    .number({
      invalid_type_error: "El ID del tipo de proceso debe ser un número",
    })
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser positivo")
    .optional() // Es opcional porque tu tabla dice que es 'null'
    .nullable(),


  unidad_tiempo: z
    .enum(UNIDADES_TIEMPO, {
      errorMap: () => ({ message: "La unidad de tiempo seleccionada no es válida" }),
    })
    .optional() // Tiene un default en la DB ('horas'), así que puede ser opcional
    .nullable(),
});

export const actualizarProcesoSchema = z.object({
  nombre: z
    .string({
      required_error: "El nombre del proceso es obligatorio",
      invalid_type_error: "El nombre debe ser un texto",
    })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre es demasiado largo" }),

  id_tipo_proceso: z.coerce
  .number({
    invalid_type_error: "El ID del tipo de proceso debe ser un número",
  })
  .int("El ID debe ser un número entero")
  .positive("El ID debe ser positivo")
  .optional() // Es opcional porque tu tabla dice que es 'null'
  .nullable(),

  unidad_tiempo: z
    .enum(UNIDADES_TIEMPO, {
      errorMap: () => ({ message: "La unidad de tiempo seleccionada no es válida" }),
    })
    .optional()
    .nullable(),  
})