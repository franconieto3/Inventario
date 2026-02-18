// server/middlewares/checkPermission.js
import { supabase } from "../config/supabase.js";

export const requirePermission = (permisoRequerido) => {
  return async (req, res, next) => {
    try {
      // req.usuario viene del middleware verificarToken previo
      const userId = req.usuario.id; 

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado." });
      }

      // Consulta a Supabase:
      const { data, error } = await supabase
        .from('usuario_roles')
        .select(`
          roles (
            rol_permisos (
              permisos (
                nombre
              )
            )
          )
        `)
        .eq('id_usuario', userId);

      if (error) throw error;

      // Aplanamos el array de permisos obtenidos
      const permisosUsuario = data.flatMap(ur => 
        ur.roles.rol_permisos.map(rp => rp.permisos.nombre)
      );

      // Verificamos si tiene el permiso
      if (permisosUsuario.includes(permisoRequerido)) {
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