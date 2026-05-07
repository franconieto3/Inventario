import {z} from 'zod'

export const instrumentoSchema = z.object({

    // Aplicamos max(100) para respetar el character varying(100) de la DB
    marca: z.string()
        .trim()
        .max(100, "La marca no puede superar los 100 caracteres")
        .optional()
        .nullable()
        .transform(val => val === '' ? null : val),

    modelo: z.string()
        .trim()
        .max(100, "El modelo no puede superar los 100 caracteres")
        .optional()
        .nullable()
        .transform(val => val === '' ? null : val),

    nro_serie: z.string()
        .trim()
        .max(100, "El número de serie no puede superar los 100 caracteres")
        .optional()
        .nullable()
        .transform(val => val === '' ? null : val),

    mes_vencimiento: z.string()
        .trim()
        .optional()
        .nullable()
        .transform(val => val === '' ? null : val),

    // Corregimos la ubicación del required_error y añadimos invalid_type_error
    categoria: z.coerce.number({
        required_error: "El ID de la categoría es obligatorio",
        invalid_type_error: "La categoría debe ser un número válido"
    }).int().positive("El ID de la categoría debe ser un número positivo"),

    activo: z.boolean().optional(),

    // Usamos preprocess para limpiar la entrada y luego z.number() para validarla correctamente
    sector: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
        z.number({ invalid_type_error: "El sector debe ser un número válido" })
            .int()
            .positive()
            .nullable()
            .optional()
    ),
});

export const categoriaSchema = z.object({
    descripcion: z.string({
        required_error: "El nombre es obligatorio"
    }).trim().min(3, "El nombre debe tener al menos 3 caracteres"),

    tipo: z.enum(['ESTANDAR', 'PROBADOR'], {
        required_error: "El tipo de instrumento es obligatorio",
    }),

    tipo_proveedor: z.enum(['INTERNO', 'EXTERNO'], {required_error: "El tipo de proveedor es obligatorio"}),

    frecuencia_meses: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
        z.number({ 
            invalid_type_error: "Debe ser un número válido",
            required_error: "La frecuencia de verificación es obligatoria" 
        })
         .int()
         .min(1, "La frecuencia en meses debe ser mayor a 0")
    ),

    usos_maximos: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
        z.number({ invalid_type_error: "Debe ser un número válido" })
         .int()
         .min(1, "Los usos máximos deben ser mayor a 0")
         .optional()
    ),

}).superRefine((data, ctx) => {
    // Validación condicionales para PROBADOR
    if (data.tipo === 'PROBADOR') {
        if (!data.usos_maximos) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Los usos máximos son obligatorios para la categoría PROBADOR",
                path: ["usos_maximos"] // Señala el error exactamente en este input
            });
        }
    }
});

export const archivoTemporalSchema = z.object({
    fileName: z.string({
        required_error: "El nombre del archivo es obligatorio",
        invalid_type_error: "El nombre del archivo debe ser un texto"
    })
    .trim()
    .min(1, "El nombre del archivo no puede estar vacío")
    .regex(/^[a-zA-Z0-9_.-]+$/, "El nombre del archivo contiene caracteres no permitidos (solo letras, números, guiones y puntos)"),

    fileType: z.string({
        required_error: "El tipo de archivo (MIME type o extensión) es obligatorio",
        invalid_type_error: "El tipo de archivo debe ser un texto"
    })
    .trim()
    .min(1, "El tipo de archivo no puede estar vacío"),

    fileSize: z.number({
        required_error: "El tamaño del archivo es obligatorio",
        invalid_type_error: "El tamaño del archivo debe ser un número (bytes)"
    })
    .int("El tamaño debe ser un número entero")
    .positive("El tamaño del archivo debe ser mayor a 0")
});

export const guardarVerificacionSchema = z.object({
    date: z.string({
        required_error: "La fecha de verificación es obligatoria",
        invalid_type_error: "La fecha debe ser un texto"
    })
    .trim()
    .min(1, "La fecha no puede estar vacía")
    .refine((val) => !isNaN(Date.parse(val)), {
        message: "El formato de la fecha no es válido (use YYYY-MM-DD o formato ISO)",
    }),

    path: z.string({
        required_error: "La ruta temporal del archivo es obligatoria",
        invalid_type_error: "La ruta debe ser un texto"
    })
    .trim()
    .min(1, "La ruta no puede estar vacía")
    .startsWith("temp/", "La ruta del archivo no es válida o no proviene del almacenamiento temporal")
});

export const guardarArchivoAuxiliarSchema = z.object({
    path: z.string({
        required_error: "La ruta del archivo temporal (path) es obligatoria",
        invalid_type_error: "La ruta del archivo debe ser un texto"
    })
    .trim()
    .min(1, "La ruta del archivo no puede estar vacía")
    .includes("/", { message: "El path debe contener un formato de ruta válido (ej. temp/archivo.pdf)" }),

    tipoDocumento: z.string({
        required_error: "El tipo de documento es obligatorio",
        invalid_type_error: "El tipo de documento debe ser un texto"
    })
    .trim()
    .min(1, "El tipo de documento no puede estar vacío")
    
});