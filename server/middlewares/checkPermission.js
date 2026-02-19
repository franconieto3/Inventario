// server/middlewares/checkPermission.js
import { supabase } from "../config/supabase.js";
import { getUserById } from "../services/auth.services.js";


export const requirePermission = (permisoRequerido) => {
  return async (req, res, next) => {
    try {
      const userId = req.usuario.id_usuario; 

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado." });
      }

      const user = await getUserById(userId);

      // Verificamos si tiene el permiso
      if (user.permisos.includes(permisoRequerido)) {
        next();
      } else {
        return res.status(403).json({ error: `Acceso denegado. Se requiere el permiso: ${permisoRequerido}` });
      }

    } catch (err) {
      console.error("Error verificando permisos:", err);
      return res.status(500).json({ error: "Error interno verificando permisos" });
    }
  };
};