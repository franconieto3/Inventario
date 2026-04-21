import {z} from 'zod'

export const crearInstrumentoSchema = z.object({
    tipo: z.enum(['ESTANDAR', 'PROBADOR'], {
        required_error: "El tipo de instrumento es obligatorio",
        invalid_type_error: "El tipo debe ser 'ESTANDAR' o 'PROBADOR'"
    }),
    
    descripcion: z.string({
        required_error: "La descripción es obligatoria"
    }).trim().min(3, "La descripción debe tener al menos 3 caracteres"),

    // Campos opcionales que pueden venir como strings vacíos desde el frontend
    marca: z.string().trim().optional().nullable().transform(val => val === '' ? null : val),
    modelo: z.string().trim().optional().nullable().transform(val => val === '' ? null : val),
    nro_serie: z.string().trim().optional().nullable().transform(val => val === '' ? null : val),
    mes_vencimiento: z.string().trim().optional().nullable().transform(val => val === '' ? null : val),

    // Transformamos el sector a número si existe, de lo contrario null
    sector: z.union([z.string(), z.number()])
        .optional()
        .nullable()
        .transform(val => (val === '' || val === null) ? null : Number(val)),

    // Campos condicionales (los definimos opcionales aquí, los validamos en superRefine)
    tipo_proveedor: z.enum(['INTERNO', 'EXTERNO']).optional().nullable(),
    
    frecuencia_meses: z.union([z.string(), z.number()])
        .optional()
        .nullable()
        .transform(val => val === '' ? null : Number(val)),

    usos_maximos: z.union([z.string(), z.number()])
        .optional()
        .nullable()
        .transform(val => val === '' ? null : Number(val)),

}).superRefine((data, ctx) => {
    // Validaciones equivalentes a chk_estandar_requerimientos
    if (data.tipo === 'ESTANDAR') {
        if (!data.tipo_proveedor) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El proveedor ('INTERNO' o 'EXTERNO') es obligatorio para instrumentos estándar",
                path: ['tipo_proveedor']
            });
        }
        if (!data.frecuencia_meses || data.frecuencia_meses < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La frecuencia en meses es obligatoria y debe ser mayor a 0",
                path: ['frecuencia_meses']
            });
        }
    }

    // Validaciones equivalentes a chk_probador_requerimientos
    if (data.tipo === 'PROBADOR') {
        if (!data.usos_maximos || data.usos_maximos < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Los usos máximos son obligatorios y deben ser mayor a 0",
                path: ['usos_maximos']
            });
        }
    }
});

export const editarInstrumentoSchema = z.object({
    descripcion: z.string({
        required_error: "La descripción es obligatoria"
    }).trim().min(3, "La descripción debe tener al menos 3 caracteres"),

    // Campos de texto generales
    marca: z.string().trim().optional().nullable().transform(val => val === '' ? null : val),
    modelo: z.string().trim().optional().nullable().transform(val => val === '' ? null : val),
    nro_serie: z.string().trim().optional().nullable().transform(val => val === '' ? null : val),
    mes_vencimiento: z.string().trim().optional().nullable().transform(val => val === '' ? null : val),

    // Campos condicionales (los manejamos como opcionales en el parseo)
    tipo_proveedor: z.enum(['INTERNO', 'EXTERNO']).optional().nullable(),
    
    frecuencia_meses: z.union([z.string(), z.number()])
        .optional()
        .nullable()
        .transform(val => val === '' ? null : Number(val)),

    usos_maximos: z.union([z.string(), z.number()])
        .optional()
        .nullable()
        .transform(val => val === '' ? null : Number(val)),
});