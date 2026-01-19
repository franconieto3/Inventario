import { supabase, supabaseAdmin } from "../config/supabase.js";

export const signedUploadUrl = async (path)=>{

    const {data,error} = await supabaseAdmin
                            .storage
                            .from('planos')
                            .createSignedUploadUrl(path, { upsert: false });

    if (error) throw new Error("No se pudo generar la URL de subida");

    return data;
}

export const obtenerMetadatos = async (BUCKET_NAME, filePath)=>{

    const { data: fileData, error: fileError } = await supabaseAdmin
            .storage
            .from(BUCKET_NAME)
            .list(filePath.split('/').slice(0, -1).join('/'), { // Listamos la carpeta contenedora
            limit: 100,
            search: filePath.split('/').pop() // Buscamos el nombre exacto del archivo
        });

    if (fileError || !fileData || fileData.length === 0) {
        const error = new Error(`El archivo '${filePath}' no fue encontrado en el bucket '${BUCKET_NAME}'. Súbelo primero.`);
        error.statusCode = 400;
        throw error;
    }

    return fileData;
}

export const guardarDocumento = async (datos)=>{

    const { data: idVersionCreada, error: rpcError } = await supabase
        .rpc('crear_documento_version_piezas', { 
        payload: datos 
        });

    if (rpcError) {
        console.error("❌ Error SQL:", rpcError);

        const error = new Error("Error al guardar el producto");
        
        if (rpcError.code === 'P0001' || rpcError.code === '23505') {
            error.statusCode = 409;
        } else {
            error.statusCode = 500;
        }

        error.code = rpcError.code;

        throw error;
    }

    return idVersionCreada;
}

export const signedUrl = async (path)=>{

    // Expira en 60 segundos. El usuario solo necesita el link para iniciar la carga en el navegador.
    const { data, error } = await supabaseAdmin
        .storage
        .from('planos')
        .createSignedUrl(path, 60); 

    if (error) {
        console.error("Error firmando URL:", error);
        const error = new Error("No se pudo obtener el documento");
        error.statusCode = 500;
        throw error;
    }

    return data;
}