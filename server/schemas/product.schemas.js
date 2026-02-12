import { z } from "zod";

export const crearPiezaSchema = z.object({
  nombrePieza: z.string({ required_error: "El nombre es obligatorio" })
    .min(1, "El nombre no puede estar vacío"),
    
  idProducto: z.coerce.number({ invalid_type_error: "ID de producto inválido" })
    .int()
    .positive(),

  // Aquí está la magia para tu caso del código
  codigo: z.preprocess(
    // Paso 1: Pre-procesar. Si es string vacío, devolvemos null. Si no, pasamos el valor.
    (val) => (val === "" ? null : val),
    // Paso 2: Validar y transformar. Coerce convierte "123" a 123. Nullable permite el null del paso 1.
    z.coerce.number().int().nullable().optional()
  )
});

export const editarPiezaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  
  // Reutilizamos la misma lógica para el código
  codigo: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce.number().int().nullable().optional()
  )
});