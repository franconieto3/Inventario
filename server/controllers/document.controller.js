import {DocumentoPayloadSchema, SolicitudSubidaSchema} from "../schemas/document.schemas.js"
import { signedUploadUrl, guardarDocumento, obtenerMetadatos, signedUrl, moverArchivoAPermanente, documentTypes} from "../services/document.service.js";
import { z } from "zod";

export const subirDocumento = async (req, res)=>{
    try{
        //¿El usuario puede subir planos? (Middleware)

        //Adaptar a distintos tipos de archivos según el tipo de documento: pedir a supabase los distintos tipos de documentos y pasarlos al schema
        const docTypes = await DocumentTypes();

        //Verificar si coincide el tipo de dato con alguno de los ingresados en la base de datos (metodo find)
        
        //Validaciones: ¿El archivo cumple con el tipo y tamaño permitidos? Agregar el esquema en una función que lo modifique según los tipos de datos
        const datosValidados = SolicitudSubidaSchema.parse(req.body);

        //Validar piezas? (servicios)

        //Creación de path temporal(servicio) 
        const path = `temp/${Date.now()}-${datosValidados.fileName}`;
        
        //Generación de url de carga
        const data = await signedUploadUrl(path);
        return res.json({ signedUrl: data.signedUrl, uploadToken: data.token, path: path });

    }
    catch(err){
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        return res.status(500).json({ error: err.message });
    }                    
}

export const documento = async (req, res)=>{
    try{
        const datosValidado = DocumentoPayloadSchema.parse(req.body);

        //Path temporal
        const tempPath = datosValidado.version.path;

        // Intentamos obtener los metadatos del archivo para ver si existe
        await obtenerMetadatos(tempPath);
        
        //Definir path final
        const finalPath = `planos/productos/${datosValidado.documento.id_producto}/${datosValidado.version.path.split('/').pop()}`
        
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
