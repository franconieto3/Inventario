// server/middlewares/checkPermission.js
import { obtenerSolicitud, verificarAccesoProvisorio } from "../services/document.service.js";


export const requirePermission = (permisoRequerido) => {
  return async (req, res, next) => {
    try {
      const userId = req.usuario.id_usuario; 

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado." });
      }

      // Verificamos si tiene el permiso
      if (req.usuario.permisos.includes(permisoRequerido)) {
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
        const permisosUsuario = req.usuario.permisos;


        req.permisosProvisorios = { descarga: false, impresion: false };

        // 1. Verificamos si tiene el permiso general por Rol
        if (permisosUsuario.includes('ver_documentos')) {
            req.permisosProvisorios = { 
              descarga: permisosUsuario.includes('descargar_documentos'), 
              impresion: permisosUsuario.includes('imprimir_documentos')
            };
            return next();
        }

        // 2. Si no tiene el rol, verificamos si tiene una solicitud provisoria válida
        const solicitud = await obtenerSolicitud(idVersion, userId);

        const horaActual = new Date().toLocaleTimeString('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        if (solicitud?.v_estado === 'APROBADA' && solicitud?.hora_inicio < horaActual && solicitud?.hora_fin > horaActual) {
            req.permisosProvisorios = {
                descarga: solicitud.permiso_descarga,
                impresion: solicitud.permiso_impresion
            };
            return next();
        }

        // 3. Bloqueamos el acceso pero informamos al frontend el estado de su solicitud
        return res.status(403).json({ 
            error: "No tienes permisos para visualizar este documento.",
            estado_solicitud: solicitud?.v_estado || null 
        });

    } catch (err) {
        console.error("Error en checkStreamPermission:", err);
        return res.status(500).json({ error: "Error interno verificando permisos de acceso" });
    }
};