import { z } from "zod";

export const validateSchema = (schema, source = 'body') => (req, res, next) => {
  try {
    schema.parse(req[source]);
    next();
  } catch (err) {
      if (err instanceof z.ZodError) {
        const errores = err.errors || [];
        
        return res.status(400).json({ 
            error: "Datos inválidos", 
            detalles: err.errors.map(e => ({ campo: e.path.join('.'), mensaje: e.message })) 
        });
      }

      return res.status(500).json({ error: "Error de validación interna" });
    }
};