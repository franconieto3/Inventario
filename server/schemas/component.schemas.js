// composicion.schema.js
import { z } from 'zod';

export const crearComposicionSchema = z.object({
  body: z.object({
    idPiezaPadre: z.number().int().positive("El ID del padre debe ser un número positivo"),
    componentes: z.array(
      z.object({
        idComponente: z.number().int().positive(),
        cantidad: z.number().int().min(1, "La cantidad debe ser al menos 1")
      })
    ).min(1, "Debes enviar al menos un componente")
  })
});