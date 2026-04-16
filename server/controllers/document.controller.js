import {DocumentoPayloadSchema, SolicitudSubidaSchema, ReestablecerVersionSchema} from "../schemas/document.schemas.js"
import { signedUploadUrl, guardarDocumento, obtenerMetadatos, signedUrl, moverArchivoAPermanente, obtenerConfiguracionTipoDocumento,obtenerTiposDocumento, obtenerHistorialVersiones, eliminarVersion, obtenerPiezasVersion, crearSolicitudCambio, verSolicitudes, actualizarSolicitud, obtenerEstadosSolicitud, getDocumentById, nuevaSolicitudAcceso, verificarAccesoProvisorio, fetchSolicitudes, updateSolicitudAcceso} from "../services/document.service.js";
import { Readable } from 'node:stream';

export const tiposDocumento = async (req, res)=>{
    try{
        const data = await obtenerTiposDocumento();
        res.json(data);
    }catch(err){
                
        if(err.statusCode){
            res.status(err.statusCode).json({error: err.message});
        }
        else{
            res.status(500).json({error: "No se pudo recuperar el listado de tipos de documentos"});
        }
    }
}

//Creación de documentos

export const subirDocumento = async (req, res)=>{
    try{
        const { idTipoDocumento, fileType, fileName } = req.body;

        //Obtener configuración dinámica desde Supabase
        const config = await obtenerConfiguracionTipoDocumento(idTipoDocumento);

        if (!config.tipos_permitidos.includes(fileType)) {
            return res.status(400).json({ 
                error: `Tipo de archivo no permitido. Permitidos: ${config.tipos_permitidos.join(', ')}` 
            });
        } 

        //Validar piezas? (servicios)

        //Creación de path temporal(servicio) 
        const path = `temp/${Date.now()}-${fileName}`;
        
        //Generación de url de carga
        const data = await signedUploadUrl(path);
        return res.json({
            signedUrl: data.signedUrl,
            uploadToken: data.token,
            path: path,
            meta: {
                destinationFolder: config.bucket_folder
            }
        });

    }
    catch(err){
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error(err);
        return res.status(500).json({ error: err.message });
    }                    
}

export const documento = async (req, res)=>{
    //Lógica de subida de documentos relacionados a productos
    try{
        //const datosValidado = DocumentoPayloadSchema.parse(req.body);
        const datosValidado = req.body;

        const config = await obtenerConfiguracionTipoDocumento(datosValidado.version.id_tipo_documento);
        
        //Path temporal
        const tempPath = datosValidado.version.path;

        // Intentamos obtener los metadatos del archivo para ver si existe
        await obtenerMetadatos(tempPath);
        
        //Definir path final
        const finalPath = `${config.bucket_folder}/productos/${datosValidado.documento.id_producto}/${datosValidado.version.path.split('/').pop()}`
        
        // Mover archivo (Atomocidad lógica)
        const data = await moverArchivoAPermanente(tempPath, finalPath);

        datosValidado.version.path = finalPath;

        //Guardado del documento en SQL
        const idVersionCreada = await guardarDocumento(datosValidado);

        // ÉXITO
        return res.status(201).json({
            message: "Documento y versión creados exitosamente",
            id_version: idVersionCreada
        });

    }catch(err){
        console.log(err);
       
        if(err.statusCode){
            return res.status(err.statusCode).json({ error: err.message });    
        }
        // Captura de otros errores no controlados
        console.error("❌ Error del servidor:", err);
        return res.status(500).json({ error: err.message });
    }
}

//Proyección de documentos
export const visualizarDocumento = async (req, res)=>{
    try {
        const { path } = req.query;

        const data = await signedUrl(path);
        res.json({ signedUrl: data.signedUrl });

    } catch (err) {
        console.error(err);
        if(err.statusCode){
            return res.status(err.statusCode).json({ error: err.message });
        }else{
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}

export const streamDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.usuario.id_usuario;

    // Obtener info del documento de la BD (para saber su path)
    const document = await getDocumentById(id);

    // Obtener la URL firmada temporal
    const url = await signedUrl(document.path);

    // Hacer proxy del archivo al cliente
    const response = await fetch(url.signedUrl);
    
    if (!response.ok) throw new Error('Error al descargar el archivo');

    // Configurar cabeceras para forzar visualización (inline) y tipo de contenido
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="documento.pdf"');
    
    // Canalizar el stream de Supabase hacia el cliente
    Readable.fromWeb(response.body).pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al transmitir el documento', error: error.message });
  }
};

//Historial de versiones

export const historialDocumentos = async (req, res) =>{
    try{
        const {idPieza, idTipoDocumento} = req.query;
        const data = await obtenerHistorialVersiones(idPieza, idTipoDocumento);
        res.json(data);

    }catch(err){
        
        if(err.statusCode){
            res.status(err.statusCode).json({error: err.message});
        }
        else{
            res.status(500).json({error: "No se pudo recuperar el historial de documentos"});
        }
    }
}

export const reestablecerVersion = async(req, res)=>{
    try{
        const datosValidados = req.body;
        
        //Obtención de los metadatos del archivo para verificar que exista
        await obtenerMetadatos(datosValidados.path);

        //Generar la fecha de vigencia y el commit desde el backend
        const nueva_fecha_vigencia = new Date().toISOString();
        const nuevo_commit = `Se recupera la versión del ${new Date(datosValidados.fecha_vigencia).toISOString().split("T")[0]}`;

        //Obtener piezas de la version
        const listadoPiezas = await obtenerPiezasVersion(datosValidados.idVersionRecuperada);

        const payload = {
            version:{
                fecha_vigencia: nueva_fecha_vigencia,
                commit: nuevo_commit,
                path: datosValidados.path,
                id_tipo_documento: datosValidados.id_tipo_documento
            },
            piezas: listadoPiezas
        }

        //Guardado de la version en SQL
        const idVersionCreada = await guardarDocumento(payload);

        // ÉXITO
        return res.status(201).json({
            message: "Documento y versión creados exitosamente",
            id_version: idVersionCreada
        });

    }catch(err){
        res.status(500).json({error: err.message});
    }
}

export const eliminacionVersion = async (req, res)=>{
    try{    
        const {id} = req.params;
        const data = await eliminarVersion(id);
        res.status(200).json({message: "Versión eliminada exitosamente"});
    }catch(err){
        res.status(err.statusCode? err.statusCode : 500).json({error: err.message});
    }
}


export const solicitudCambio = async(req, res)=>{
	try{
		const {idUsuario, mensaje, idVersion} = req.body;
        
		const data = await crearSolicitudCambio(idUsuario, mensaje, idVersion);

		return res.status(201).json({message: "La solicitud fue creada exitosamente"});
	}catch(err){
		console.error(err);
		return res.status(err.statusCode? err.statusCode :500).json({error: err.message? err.message : "Ocurrió un error al crear la solicitud"})
	}
}

export const solicitudesCambio = async(req, res) =>{
    try{
        const { page = 1, limit = 20 , status} = req.query;

        const result = await verSolicitudes(page, limit, status);

        return res.status(200).json({
            message: "Solicitudes recuperadas exitosamente", 
            data: result.data,
            total: result.total
        });

    }catch(err){
        console.log("Detalle", err);
        console.error(err);
        return res.status(err.statusCode? err.statusCode :500).json({
            error: err.message? err.message : "Ocurrió un error al obtener las solicitudes"
        })
    }
}

export const solicitudTerminada = async (req, res)=>{
    try{
        const {idSolicitud, idUsuario, idEstado} = req.body;
        const data = await actualizarSolicitud(idSolicitud, idUsuario, idEstado);
        return res.status(201).json({message: "Solicitud actualizada correctamente"});
    }catch(err){
        console.error(err);
        return res.status(err.statusCode? err.statusCode :500).json({error: err.message});  
    }
}

export const estadoSolicitud = async(req, res)=>{
    try{
        const data = await obtenerEstadosSolicitud();
        return res.status(200).json({message:"Estados obtenidos correctamente", data: data})
    }catch(err){
        console.error(err);
        return res.status(err.statusCode? err.statusCode :500).json({error: err.message});  
    }
}

export const crearSolicitudAcceso = async (req, res)=>{
    try{
        const userId = req.usuario.id_usuario;
        const {id} = req.params;

        // Validar si ya existe una pendiente o aprobada
        const estadoExistente = await verificarAccesoProvisorio(id, userId);
        
        if (estadoExistente === 'PENDIENTE' || estadoExistente === 'APROBADA') {
            return res.status(400).json({ 
                error: `Ya existe una solicitud no expirada en estado: ${estadoExistente}` 
            });
        }

        const data = await nuevaSolicitudAcceso(Number(id), userId)

        return res.status(200).json({message: "Solicitud enviada exitosamente"});

    }catch(err){
        console.log(err);
        return res.status(err.statusCode? err.statusCode :500).json({error: err.message}); 
    }
}

export const getSolicitudesAcceso = async (req, res) => {
    try {
        // 1. Extraer parámetros de la query de la URL
        // Ejemplo de URL esperada: /api/documentos/solicitudes-acceso?page=1&limit=20&estado=PENDIENTE
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const estado = req.query.estado || null;

        // 2. Llamar al servicio
        const result = await fetchSolicitudes({ 
            page, 
            pageSize: limit, 
            estado 
        });

        // 3. Manejar la respuesta del servicio
        if (!result.success) {
            // Si el servicio devolvió un error controlado
            return res.status(400).json({
                success: false,
                message: result.error || 'Error al obtener las solicitudes de acceso.'
            });
        }

        // 4. Enviar respuesta exitosa
        return res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta
        });

    } catch (error) {
        console.error('[Controller - getSolicitudesAcceso] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al procesar la solicitud.',
            error: error.message
        });
    }
};

export const actualizarSolicitudAcceso = async (req, res)=>{
    try{
        const userId = req.usuario.id_usuario;
        const {id} = req.params;
        const {hora_inicio, hora_fin, fecha_vencimiento, estado} = req.body;

        // 1. Validación de campos obligatorios
        if (!id || !hora_inicio || !hora_fin || !fecha_vencimiento || !estado) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios para actualizar la solicitud.'
            });
        }

        const result = await updateSolicitudAcceso(id, {
            hora_inicio,
            hora_fin,
            fecha_vencimiento,
            estado
        },userId);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Solicitud actualizada correctamente.',
            data: result.data
        });

    }catch(err){
        console.error('[Controller - actualizarSolicitudAcceso] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor.',
            error: error.message
        });
    }
}