import { supabase, supabaseAdmin } from "../config/supabase.js";


export const obtenerConfiguracionTipoDocumento = async (idTipoDocumento) => {
    const { data, error } = await supabase
        .from('tipo_documento')
        .select('bucket_folder, tipos_permitidos') // Asumo que estas columnas ya existen
        .eq('id_tipo_documento', idTipoDocumento)
        .maybeSingle();

    if (error || !data) {
        const err = new Error("Tipo de documento no válido o no encontrado");
        err.statusCode = 404; // Not Found
        throw err;
    }

    return data;
}

export const obtenerTiposDocumento = async()=>{
    const {data, error} = await supabase.from('tipo_documento').select('*');
    if (error || !data){
        const err = new Error("Tipos de documentos no encontrados");
        err.statusCode = 404; // Not Found
        throw err;
    }
    return data;
}

export const signedUploadUrl = async (path)=>{

    const {data,error} = await supabaseAdmin
                            .storage
                            .from('gestion_documental_privada')
                            .createSignedUploadUrl(path, { upsert: false });

    if (error) throw new Error("No se pudo generar la URL de subida");

    return data;
}

export const obtenerMetadatos = async (filePath)=>{

    const { data: fileData, error: fileError } = await supabaseAdmin
            .storage
            .from('gestion_documental_privada')
            .list(filePath.split('/').slice(0, -1).join('/'), { // Listamos la carpeta contenedora
            limit: 100,
            search: filePath.split('/').pop() // Buscamos el nombre exacto del archivo
        });

    if (fileError || !fileData || fileData.length === 0) {
        const error = new Error(`El archivo '${filePath}' no fue encontrado. Súbelo primero.`);
        error.statusCode = 400;
        throw error;
    }

}

export const moverArchivoAPermanente = async (tempPath, finalPath) => {
    const { data, error } = await supabaseAdmin
        .storage
        .from('gestion_documental_privada')
        .move(tempPath, finalPath);

    if (error) throw new Error("Error moviendo el archivo a almacenamiento permanente");
    return data;
}

export const guardarDocumento = async (datos)=>{

    const { data: idVersionCreada, error: rpcError } = await supabase
    .rpc('cargar_version_documento_pieza', { 
    payload: datos 
    });
    

    if (rpcError) {
        console.error("❌ Error SQL:", rpcError);
        console.log(rpcError);
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
        .from('gestion_documental_privada')
        .createSignedUrl(path, 60); 

    if (error) {
        console.error("Error firmando URL:", error);
        const error = new Error("No se pudo obtener el documento");
        error.statusCode = 500;
        throw error;
    }

    return data;
}

export const obtenerHistorialVersiones = async (idPieza, idTipoDocumento) =>{
    
    const {data, error} = await supabase.rpc(
        'obtener_historial_versiones', 
        {
            p_id_pieza: idPieza,
            p_id_tipo_documento: idTipoDocumento
        }
    );

    if(error){
        console.error("Error obteniendo historial de versiones: ", error);
        const err = new Error("No se pudo recuperar el historial de versiones"); 
        err.statusCode = 500
        throw err;
    }

    return data;
}

export const eliminarVersion = async (idVersion)=>{
    
    const {data, error} = await supabase.rpc(
        'eliminar_version_pieza',
        {
            p_id_version: idVersion
        }
    );
    if(error){
        console.error(err);
        const err = new Error("Ocurrió un error eliminando la versión");
        err.statusCode = 500;
        throw err;
    }
    return data;
}

export const obtenerPiezasVersion = async (idVersion) => {
    
    const { data, error } = await supabase
        .from('version_pieza')
        .select('id_pieza')
        .eq('id_version', idVersion);

    // Verificamos si hubo error
    if (error) {
        const err = new Error("No se pudo recuperar las piezas de la versión");
        err.statusCode = 500; 
        throw err;
    }

    // Opcional: Si quieres lanzar error 404 si la lista está vacía
    if (!data || data.length === 0) {
         const err = new Error("No se encontraron piezas para esta versión");
         err.statusCode = 404;
         throw err;
    }
    const piezas = data.map((item)=>item.id_pieza);

    return piezas;
}

export const crearSolicitudCambio = async(idUsuario, mensaje, idVersion)=>{

	const {data, error} = await supabase.rpc('crear_solicitud_cambio',{
		p_id_usuario: idUsuario, 
		p_mensaje: mensaje, 
		p_id_version_afectada: idVersion
	});
	
	if(error || data===null){
        console.log(error);
		const err = new Error("Ocurrió un error al crear la solicitud")
		err.statusCode = 500;
		throw err
	}
	return data;
}

export const verSolicitudes = async()=>{
    const {data, error} = await supabase
        .rpc('obtener_solicitudes_cambio',{});

    if (error) {
        console.log(error);
        if(error.code == 'PGRST116'){
            return [];
        }
        const err = new Error("Error al obtener las solicitudes")
        err.statusCode = 500;
        throw err;
    }
    
    return data;
}