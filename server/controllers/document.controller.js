import {DocumentoPayloadSchema} from "../schemas/document.schemas.js"
import { signedUploadUrl, guardarDocumento, obtenerMetadatos, signedUrl} from "../services/document.service.js";
import { z } from "zod";

export const subirPlano = async (req, res)=>{
    try{
        const {fileName, fileType, fileSize } = req.body;

        //Validaciones (esquemas)

        //¿El usuario puede subir planos? (Middleware)

        //¿El archivo cumple con el tipo y tamaño permitidos? (esquemas)
        const allowedTypes = ['application/pdf'];
        if (!allowedTypes.includes(fileType)) {
            return res.status(400).json({ error: "Tipo de archivo no permitido" });
        }

        const MAX_SIZE = 50 * 1024 * 1024; 
        if (fileSize > MAX_SIZE) {
             return res.status(400).json({ error: "El archivo excede los 50MB" });
        }

        //Validar piezas (servicios)

        //Creación de path temporal 
        const path = `temp/${Date.now()}-${fileName}`;

        const data = await signedUploadUrl(path);
        return res.json({ signedUrl: data.signedUrl, uploadToken: data.token, path: path });

    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }                    
}

export const documento = async (req, res)=>{
    try{
        const datosValidado = DocumentoPayloadSchema.parse(req.body);

        // Intentamos obtener los metadatos del archivo para ver si existe
        const BUCKET_NAME = 'planos';
        //Path temporal
        const tempPath = datosValidado.version.path;
        
        await obtenerMetadatos(tempPath);
        
        //Definir path final
        const finalPath = `productos/${datosValidado.documento.id_producto}/${datosValidado.version.path.split('/').pop()}`
        
        // Mover archivo (Atomocidad lógica)
        await moverArchivoAPermanente(tempPath, finalPath);

        datosValidado.version.path = finalPath;

        //Guardado del documento en SQL
        const idVersionCreada = await guardarDocumento(datosValidado);

        // ÉXITO
        return res.status(201).json({
            message: "Documento y versión creados exitosamente",
            id_version: idVersionCreada
        });

    }catch(err){
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

export const visualizarPlano = async (req, res)=>{
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
