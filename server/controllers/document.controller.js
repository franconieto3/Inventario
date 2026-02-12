import {DocumentoPayloadSchema, SolicitudSubidaSchema, ReestablecerVersionSchema} from "../schemas/document.schemas.js"
import { signedUploadUrl, guardarDocumento, obtenerMetadatos, signedUrl, moverArchivoAPermanente, obtenerConfiguracionTipoDocumento,obtenerTiposDocumento, obtenerHistorialVersiones, eliminarVersion} from "../services/document.service.js";
import { z } from "zod";

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
        //¿El usuario puede subir documentos? (Middleware)

        const { idTipoDocumento } = req.body;

        if (!idTipoDocumento) {
            return res.status(400).json({ error: "Es obligatorio especificar el tipo de documento a subir" });
        }
        //Obtener configuración dinámica desde Supabase
        const config = await obtenerConfiguracionTipoDocumento(idTipoDocumento);

        //Generación de esquema dinámico
        const esquemaDinamico = SolicitudSubidaSchema(config.tipos_permitidos);

        //Validaciones: ¿El archivo cumple con el tipo y tamaño permitidos? Agregar el esquema en una función que lo modifique según los tipos de datos
        const datosValidados = esquemaDinamico.parse(req.body);

        //Validar piezas? (servicios)

        //Creación de path temporal(servicio) 
        const path = `temp/${Date.now()}-${datosValidados.fileName}`;
        
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
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
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
        const datosValidado = DocumentoPayloadSchema.parse(req.body);

        //const config = await obtenerConfiguracionTipoDocumento(datosValidado.documento.id_tipo_documento);
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
        if (err instanceof z.ZodError) {
            return res.status(400).json({ 
            error: "Datos inválidos", 
            detalles: err.errors.map(e => ({ campo: e.path.join('.'), mensaje: e.message })) 
            });
        }
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
        const { path } = req.body;

        if (!path) {
            return res.status(400).json({ error: "El path del archivo es obligatorio" });
        }

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
        //Validaciones
        const datosValidados = ReestablecerVersionSchema.parse(req.body);
        
        //Obtención de los metadatos del archivo para verificar que exista
        await obtenerMetadatos(datosValidados.path);

        //Generar la fecha de vigencia y el commit desde el backend
        const nueva_fecha_vigencia = new Date().toISOString();
        const nuevo_commit = `Se recupera la versión del ${new Date(datosValidados.fecha_vigencia).toISOString().split("T")[0]}`;

        const payload = {
            fecha_vigencia: nueva_fecha_vigencia,
            commit: nuevo_commit,
            path: datosValidados.path,
            id_tipo_documento: datosValidados.id_tipo_documento
        }

        //Guardado de la version en SQL
        const idVersionCreada = await guardarDocumento(datosValidado);

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