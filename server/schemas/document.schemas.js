import { z } from 'zod';

export const SolicitudSubidaSchema = z.object({
    fileName: z.string().min(1, "El nombre es requerido"),
    fileType: z.enum(['application/pdf'], {
      errorMap: () => ({ message: "Tipo de archivo no permitido. Solo PDF." })
    }),
    fileSize: z.number().max(50 * 1024 * 1024, "El archivo excede los 50MB"),
    idProducto: z.number().optional() // Útil si quieres organizar temp por producto
});

export const DocumentoPayloadSchema = z.object({
  documento: z.object({
    id_tipo_documento: z.number().int().positive({ message: "ID de tipo inválido" }),
    descripcion: z.string().min(3, { message: "La denominación es muy corta" }),
    id_producto: z.number().int().positive({ message: "ID de producto inválido" })
  }),
  version: z.object({
    n_version: z.number().int().nonnegative(),
    fecha_vigencia: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Formato de fecha inválido (Use ISO 8601)"
    }),
    commit: z.string().optional(),
    path: z.string().min(1, { message: "El path del archivo es obligatorio" })
  }),
  piezas: z.array(z.number().int()).optional().default([])
});