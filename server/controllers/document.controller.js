import {DocumentoPayloadSchema} from "../schemas/document.schemas.js"
import { signedUrl, guardarDocumento } from "../services/document.service.js";

export const crearSignedUrl = async (req, res)=>{
    try{
        const {fileName} = req.body;

        //Validaciones
        //¿El usuario puede subir planos?
        //¿El archivo cumple con el tipo y tamaño permitidos?
        //Validar piezas 

        const path = `planos/${Date.now()}-${fileName}`;
        const data = await signedUrl(fileName, path);
        return res.json({ signedUrl: data.signedUrl, uploadToken: data.token, path: path });
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }                    
}

export const documento = async ()=>{
    try{
        const datosValidado = DocumentoPayloadSchema.parse(req.body);

        // Intentamos obtener los metadatos del archivo para ver si existe
        const BUCKET_NAME = 'planos';
        const filePath = datosValidado.version.path;

        const { data: fileData, error: fileError } = await supabaseAdmin
            .storage
            .from(BUCKET_NAME)
            .list(filePath.split('/').slice(0, -1).join('/'), { // Listamos la carpeta contenedora
            limit: 100,
            search: filePath.split('/').pop() // Buscamos el nombre exacto del archivo
        });

        if (fileError || !fileData || fileData.length === 0) {
            return res.status(400).json({ 
            error: "Validación de Archivo Fallida", 
            message: `El archivo '${filePath}' no fue encontrado en el bucket '${BUCKET_NAME}'. Súbelo primero.` 
            });
        }

        // Ejecutar la Función SQL (RPC)
        /*
        const { data: idVersionCreada, error: rpcError } = await supabase
            .rpc('crear_documento_version_piezas', { 
            payload: datosValidado 
            });

        if (rpcError) {
            // Manejamos errores específicos de SQL
            console.error("❌ Error SQL:", rpcError);
            
            // Si es el error que lanzamos manualmente en SQL o constraint unique
            if (rpcError.code === 'P0001' || rpcError.code === '23505') { 
                return res.status(409).json({ error: "Conflicto", message: rpcError.message });
            }
            
            return res.status(500).json({ error: "Error de Base de Datos", details: rpcError.message });
        }*/

        const idVersionCreada = guadarDocumento(datosValidado);

        // ÉXITO
        return res.status(201).json({
            message: "Documento y versión creados exitosamente",
            id_version: idVersionCreada
        });

    }catch(err){
        if (err instanceof z.ZodError) {
            return res.status(400).json({ 
            error: "Datos inválidos", 
            detalles: error.errors.map(e => ({ campo: e.path.join('.'), mensaje: e.message })) 
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

