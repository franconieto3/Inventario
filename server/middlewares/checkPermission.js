// server/middlewares/checkPermission.js
import { getUserById } from "../services/auth.services.js";
import { verificarAccesoProvisorio } from "../services/document.service.js";


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
      if (typeof onErrorCallback === 'function') {
        return onErrorCallback(err, req, res, next);
      }
      console.error("Error verificando permisos:", err);
      return res.status(500).json({ error: "Error interno verificando permisos" });
    }
  };
};

export const checkStreamPermission = async (req, res, next) => {
    try {
        const userId = req.usuario.id_usuario; 
        const idVersion = req.params.id;

        // 1. Verificamos si tiene el permiso general por Rol
        const user = await getUserById(userId);
        if (user.permisos.includes('ver_documentos')) {
            return next();
        }

        // 2. Si no tiene el rol, verificamos si tiene una solicitud provisoria válida
        const estadoSolicitud = await verificarAccesoProvisorio(idVersion, userId);

        if (estadoSolicitud === 'APROBADA') {
            // Aquí podrías sumar lógica para validar hora_inicio y hora_fin si lo deseas
            return next();
        }

        // 3. Bloqueamos el acceso pero informamos al frontend el estado de su solicitud
        return res.status(403).json({ 
            error: "No tienes permisos para visualizar este documento.",
            estado_solicitud: estadoSolicitud || null 
        });

    } catch (err) {
        console.error("Error en checkStreamPermission:", err);
        return res.status(500).json({ error: "Error interno verificando permisos de acceso" });
    }
};