import { supabaseAdmin } from "../config/supabase.js";

export const signedUrl = async ()=>{

    const {data,error} = await supabaseAdmin
                            .storage
                            .from('planos')
                            .createSignedUploadUrl(path, { upsert: false });

    if (error) throw new Error("No se pudo generar la URL de subida");

    return data;
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