import { z } from 'zod';

export const SolicitudSubidaSchema = z.object({
        idTipoDocumento: z.coerce.number().int().positive({ message: "ID de tipo requerido" }),
        fileName: z.string().min(1, "El nombre es requerido"),
        fileType: z.string().min(1, "El tipo de archivo es requerido"),
        fileSize: z.number().max(50 * 1024 * 1024, "El archivo excede los 50MB"),
        idProducto: z.coerce.number().optional() // Útil si quieres organizar temp por producto
    });

export const DocumentoPayloadSchema = z.object({
  //Borrar todo el índice documento
  
  documento: z.object({
    id_producto: z.coerce.number().int().positive({ message: "ID de producto inválido" })
  }),
  version: z.object({
    id_tipo_documento: z.coerce.number().int().positive({ message: "ID de tipo inválido" }),
    fecha_vigencia: z.coerce.date({
      invalid_type_error: "Fecha inválida",
    }),
    commit: z.string().optional(),
    path: z.string().min(1, { message: "El path del archivo es obligatorio" })
  }),
  piezas: z.array(z.number().int()).optional().default([])
});

export const ReestablecerVersionSchema = z.object({
  idVersionRecuperada: z.coerce.number().int().positive({message: "ID de versión inválida"}),
  fecha_vigencia: z.coerce.date({
    invalid_type_error: "Fecha inválida",
  }),
  commit: z.string().optional(),
  path: z.string().min(1, { message: "El path del archivo es obligatorio" }),
  id_tipo_documento: z.coerce.number().int().positive({ message: "ID de tipo inválido" })
});

export const VisualizarDocumentoSchema = z.object({
  path: z.string().min(1, { message: "El path del archivo es obligatorio" })
});

export const HistorialVersionesSchema = z.object({
  idPieza: z.coerce.number().int().positive({message: "ID de pieza requerido"}),
  idTipoDocumento: z.coerce.number().int().positive({message: "Tipo de documento requerido"}),
});

export const eliminarVersionSchema = z.object({
  id: z.coerce.number().int().positive({message: "Especifique el ID de la versión a eliminar"})
});

export const solicitudCambioSchema = z.object({
	idUsuario: z.coerce.number().int().positive("ID de usuario inválido"),
	mensaje: z.string().min(1, {message: "La descripción del cambio es obligatoria"}),
	idVersion: z.coerce.number().int().positive("ID de versión inválida")
});

export const actualizarSolicitudSchema = z.object({
  idSolicitud: z.coerce.number().int().positive("ID de solicitud inválida"),
  idUsuario: z.coerce.number().int().positive("ID de usuario inválida"),
  idEstado: z.coerce.number().int().positive("ID de estado inválida"),
})