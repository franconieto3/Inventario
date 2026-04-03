import { z } from "zod";


const UNIDADES_TIEMPO = ["segundos", "minutos", "horas", "dias", "semanas", "meses"]; 

export const procesoSchema = z.object({
  nombre: z
    .string({
      required_error: "El nombre del proceso es obligatorio",
      invalid_type_error: "El nombre debe ser un texto",
    })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre es demasiado largo" }),
  unidad_tiempo: z
    .enum(UNIDADES_TIEMPO, {
      errorMap: () => ({ message: "La unidad de tiempo seleccionada no es válida" }),
    })
    .optional() // Tiene un default en la DB ('horas'), así que puede ser opcional
    .nullable(),
});


// 1. Definimos el esquema para los elementos del array "procesos" 
// basado en la tabla public.proceso_bop
const procesoBopSchema = z.object({
  
  id_bop: z.coerce
    .number({ required_error: "El id_bop es obligatorio" })
    .int("El id_bop debe ser un número entero"),
  
  id_proceso: z.coerce
    .number()
    .int("El id_proceso debe ser un número entero"),
  
  orden_secuencia: z.coerce
    .number("El orden de secuencia es obligatorio" )
    .int("El orden_secuencia debe ser un número entero"),
  
  requiere_inspeccion: z
    .boolean("Debe ser un valor booleano (true/false)" ),
  
  tiempo_estandar: z.coerce
    .number()
    .int()
    .default(0)
    .optional(), // default '0'::bigint según la base de datos
});

// 2. Definimos el esquema principal englobando todo en "ruta"
export const rutaSchema = z.object({
  ruta: z.object({
    nombre: z
      .string({
        required_error: "El nombre del proceso es obligatorio",
        invalid_type_error: "El nombre debe ser un texto",
      })
      .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
      .max(100, { message: "El nombre es demasiado largo" }),

    id_tipo_ruta: z.coerce // Renombrado de id_tipo_proceso según tu instrucción final
      .number({
        invalid_type_error: "El ID del tipo de ruta debe ser un número",
      })
      .int("El ID debe ser un número entero")
      .positive("El ID debe ser positivo"),
      
    procesos: z.array(procesoBopSchema, {
      required_error: "La lista de procesos es obligatoria",
      invalid_type_error: "Los procesos deben ser un arreglo (array)",
    }),
  }).optional(), // Hace que el objeto "ruta" entero sea opcional
});