import { z } from "zod";


export const productoSchema = z.object({
  nombre: z.string({ required_error: "Datos incompletos" })
           .min(1, "Datos incompletos"),
  
  id_registro_pm: z.coerce.number().optional(),
  id_rubro: z.coerce.number().optional(),

  piezas: z.array(
    z.object({
      // 1. Aquí RELAJAMOS la regla base. Permitimos string vacío u opcional.
      // Esto es necesario para que pase la validación inicial del tipo.
      nombre: z.string().optional(), 
      codigo: z.string().optional()
    })
  )
  .min(1, "Datos incompletos") // Debe haber al menos 1 pieza
  
  // 2. Aquí aplicamos la LÓGICA CONDICIONAL compleja
  .superRefine((items, ctx) => {
    
    // CASO A: Hay más de 1 pieza
    if (items.length > 1) {
      
      const nombres = items.map(p => p.nombre);

      // Regla 1: Validar que ninguna esté vacía o undefined
      items.forEach((item, index) => {
        if (!item.nombre || item.nombre.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Hay al menos una pieza sin denominación",
            path: [index, "nombre"] // Esto marca exactamente qué input falló
          });
        }
      });

      // Regla 2: Validar duplicados (solo si todas tienen nombre para evitar ruido)
      // Nota: Si quieres reportar duplicados incluso si hay vacíos, quita el filtro.
      const nombresFiltrados = nombres.filter(n => n && n.trim() !== "");
      if (new Set(nombresFiltrados).size !== nombresFiltrados.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hay al menos dos piezas con la misma denominación",
          // path: [] // Puedes dejarlo global al array o apuntar a índices específicos si quisieras lógica extra
        });
      }
    }
    
    // CASO B: Hay exactamente 1 pieza
    // No hacemos nada (return implícito), por lo que pasa la validación 
    // aunque nombre sea "" o undefined.
  }),
});

export const editarProductoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  idRubro: z.coerce.number().int("ID de rubro inválido"),
  idRegistroPm: z.coerce.number().int("ID de registro PM inválido")
});

export const crearPiezaSchema = z.object({
  nombrePieza: z.string({ required_error: "El nombre es obligatorio" })
    .min(1, "El nombre no puede estar vacío"),
  idProducto: z.coerce.number({ invalid_type_error: "ID de producto inválido" }).int().positive(),
  codigo: z.string().optional()
});

export const editarPiezaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  
  // Reutilizamos la misma lógica para el código
  codigo: z.string().optional()
});

// Validación individual de la pieza para la carga masiva
const piezaMasivaSchema = z.object({
    nombre: z.string({
        required_error: "El nombre de la pieza debe ser un texto (puede ser vacío)",
        invalid_type_error: "El nombre de la pieza debe ser una cadena de texto"
    }), 
    codigo_produccion: z.string().optional().default("")
});

// Validación del producto que contiene las piezas
const productoMasivoSchema = z.object({
    nombre: z.string()
        .trim()
        .min(1, "El nombre del producto es obligatorio y no puede estar vacío"),
    id_registro_pm: z.coerce.number().int().nonnegative().optional().default(0),
    id_rubro: z.coerce.number().int().nonnegative().optional().default(0),
    piezas: z.array(piezaMasivaSchema)
        .min(1, "Un producto debe tener al menos una pieza asociada")
        .refine(
            (piezas) => {
                const nombres = piezas.map((p) => p.nombre);
                return new Set(nombres).size === nombres.length;
            },
            { message: "Dos piezas no pueden tener el mismo nombre dentro de un mismo producto" }
        )
});

export const cargaMasivaSchema = z.array(productoMasivoSchema)
    .min(1, "El lote a procesar debe contener al menos un producto");