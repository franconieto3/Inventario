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

export const asociarComposicionBulkSchema = z.object({
  idPiezasPadre: z.array(z.coerce.number({
    required_error: "Cada id de pieza padre debe ser un número entero."
  })).min(1, "Debes seleccionar al menos una pieza padre."),
  
  componentes: z.array(
    z.object({
      idComponente: z.coerce.number({ required_error: "El id del componente es obligatorio." }),
      cantidad: z.coerce.number().min(1, "La cantidad debe ser mayor o igual a 1.")
    })
  ).min(1, "Debes agregar al menos un componente.")
});