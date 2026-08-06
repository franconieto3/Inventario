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

export const grafoSchema = z.object({
  ruta: z.object({
    nombre: z.string({
      required_error: "El nombre de la ruta es obligatorio",
      invalid_type_error: "El nombre debe ser un texto",
    }).min(1, { message: "El nombre de la ruta no puede estar vacío" }),
    
    id_tipo_ruta: z.number({
      required_error: "El id_tipo_ruta es obligatorio",
      invalid_type_error: "El id_tipo_ruta debe ser un número",
    })
    .int("El id_tipo_ruta debe ser un número entero")
    .positive("El id_tipo_ruta debe ser un número positivo"),
  }, {
    required_error: "El objeto 'ruta' es obligatorio",
  }),

  nodos: z.array(
    z.object({
      id_local: z.string({
        required_error: "El id_local del nodo es obligatorio",
      }),
      
      // Permitimos null porque los nodos de "Inicio" y "Fin" no tienen id_proceso asociado en el frontend
      id_proceso: z.number()
        .int("El id_proceso debe ser un número entero")
        .nullable()
        .optional(), 
        
      requiere_inspeccion: z.boolean({
        invalid_type_error: "requiere_inspeccion debe ser un booleano",
      }).default(false),
      
      x: z.number({
        required_error: "La coordenada X es obligatoria",
      }).int("La coordenada X debe ser entera"),
      
      y: z.number({
        required_error: "La coordenada Y es obligatoria",
      }).int("La coordenada Y debe ser entera"),
      
      inicio: z.boolean().default(false),
      fin: z.boolean().default(false),
    })
  , {
    required_error: "La lista de nodos es obligatoria",
    invalid_type_error: "La estructura de nodos debe ser un array",
  }).min(2, "Debe haber al menos 2 nodos (Inicio y Fin)"),

  aristas: z.array(
    z.object({
      origen_local: z.string({
        required_error: "El origen_local de la arista es obligatorio",
      }),
      
      destino_local: z.string({
        required_error: "El destino_local de la arista es obligatorio",
      }),
      
      prioridad: z.number({
        required_error: "La prioridad de la arista es obligatoria",
      }).int("La prioridad debe ser un número entero").default(1),
    })
  , {
    required_error: "La lista de aristas es obligatoria",
    invalid_type_error: "La estructura de aristas debe ser un array",
  }),
});

//Asociación de piezas a una ruta
export const asociarRutaPiezasSchema = z.object({
  piezas: z.array(
      z.coerce
        .number({
          invalid_type_error: "El ID de la pieza debe ser un número válido.",
        })
        .int("Los IDs de las piezas deben ser enteros.")
        .positive("Los IDs de las piezas deben ser positivos.")
    ).min(1, "Debes incluir al menos una pieza."),
    
  ruta: 
    z.coerce
      .number({
        invalid_type_error: "El ID de la pieza debe ser un número.",
      })
      .int("Los IDs de las piezas deben ser enteros.")
      .positive("Los IDs de las piezas deben ser positivos.")
});