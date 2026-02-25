import {DocumentoPayloadSchema, SolicitudSubidaSchema, ReestablecerVersionSchema} from "../schemas/document.schemas.js"
import { signedUploadUrl, guardarDocumento, obtenerMetadatos, signedUrl, moverArchivoAPermanente, obtenerConfiguracionTipoDocumento,obtenerTiposDocumento, obtenerHistorialVersiones, eliminarVersion, obtenerPiezasVersion, crearSolicitudCambio, verSolicitudes, actualizarSolicitud, obtenerEstadosSolicitud} from "../services/document.service.js";


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