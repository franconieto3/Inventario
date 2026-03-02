// composicion.schema.js
import { z } from 'zod';

export const crearComposicionSchema = z.object({
  idPiezaPadre: z.coerce.number().int().positive("El ID del padre debe ser un número positivo"),
  componentes: z.array(
    z.object({
      idComponente: z.coerce.number().int().positive(),
      cantidad: z.number().int().min(1, "La cantidad debe ser al menos 1")
    })
  ).min(1, "Debes enviar al menos un componente")
  
});

export const editarComposicionSchema = z.object(
  {
    idPiezaPadre:z.coerce.number().int().positive("El ID de la pieza debe ser un número positivo"),
    idPiezaHijo:z.coerce.number().int().positive("El ID del componente debe ser un número positivo"),
    cantidad: z.number().int().min(1, "La cantidad debe ser al menos 1")
  }
);