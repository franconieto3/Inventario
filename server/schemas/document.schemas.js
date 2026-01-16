import { z } from 'zod';

const DocumentoPayloadSchema = z.object({
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