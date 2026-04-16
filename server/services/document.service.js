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

//Creación

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

//Proyección

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

export const getDocumentById = async (idDocumento)=>{
    const {data, error} = await supabase
        .from('version')
        .select('path')
        .eq('id_version', idDocumento)
        .single();

    if(error) throw new Error("No se pudo recuperar el documento seleccionado");

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

//Eliminación

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

//Solicitudes de cambio de documentos

export const crearSolicitudCambio = async(idUsuario, mensaje, idVersion)=>{

	const {data, error} = await supabase.rpc('crear_solicitud_cambio',{
		p_id_usuario: idUsuario, 
		p_mensaje: mensaje, 
		p_id_version_afectada: idVersion
	});
    console.log('data', data);
	
	if(error || data===null){
        console.log('error', error);
		const err = new Error("Ocurrió un error al crear la solicitud")
		err.statusCode = 500;
		throw err
	}
	return data;
}

export const verSolicitudes = async(page = 1, limit = 20, status = null)=>{

    const offset = (page - 1) * limit;
    const p_id_estado = (status && status !== "0") ? parseInt(status) : null;

    const {data, error} = await supabase.rpc('obtener_solicitudes_cambio',{
        p_limit: parseInt(limit),
        p_offset: offset,
        p_id_estado: p_id_estado        
    });
    
    if (error) {
        if(error.code == 'PGRST116'){
            return { data: [], total: 0 };
        }
        const err = new Error("Error al obtener las solicitudes")
        err.statusCode = 500;
        throw err;
    }

    const total = data.length > 0 ? parseInt(data[0].total_count) : 0;
    const cleanData = data.map(({ total_count, ...rest }) => rest);

    return { data: cleanData, total };
}

export const actualizarSolicitud = async(idSolicitud, idUsuario, idEstado)=>{
    const {data, error} = await supabase.rpc('actualizar_solicitud_cambio',
        {
            p_id_solicitud: idSolicitud,
            p_id_responsable: idUsuario,
            p_id_estado: idEstado
        })
    if(error){
        const err = new Error ("Error al actualizar la solicitud");
        err.statusCode = 500;
        throw err;
    }
    return data;
}

export const obtenerEstadosSolicitud = async ()=>{
    const {data,error}= await supabase.from('estado_solicitud_cambio').select('*');
    
    if(error){
        console.error(err);
        const err = new Error("Ocurrió un error obteniendo estados de solicitudes");
        err.statusCode = 500;
        throw err;
    }

    return data
}

export const nuevaSolicitudAcceso = async (idVersion, idSolicitante) => {
    const { data, error } = await supabase
        .from('solicitud_acceso_documento')
        .insert({
            'id_version': idVersion, 
            'id_solicitante': idSolicitante
        })
        .select();

    if (error) {
        if (error.code === '23503') {
            const err = new Error("La versión del documento o el usuario solicitante no existen en el sistema.");
            err.statusCode = 404; 
            if (error.message.includes('id_solicitante')) {
                err.message = "El usuario solicitante no existe.";
            } else if (error.message.includes('id_version')) {
                err.message = "La versión del documento no existe.";
            }
            
            throw err;
        }
        
        const err = new Error("Ocurrió un error interno. No se pudo realizar la solicitud.");
        err.statusCode = 500;
        throw err;
    }
    
    return data;
}

export const verificarAccesoProvisorio = async (idVersion, idUsuario) => {
    const { data, error } = await supabase.rpc('verificar_estado_solicitud_acceso', {
        p_id_version: parseInt(idVersion),
        p_id_usuario: idUsuario
    });
    
    if (error) {
        console.error("Error verificando acceso provisorio:", error);
        throw new Error("No se pudo verificar el estado de los permisos provisorios");
    }
    
    return data; 
}

export async function fetchSolicitudes({ page = 1, pageSize = 10, estado = null } = {}) {
  try {
    const offset = (page - 1) * pageSize;

    // Llamada al Stored Procedure
    const { data, error } = await supabase.rpc('get_solicitudes_paginadas', {
      p_limit: pageSize,
      p_offset: offset,
      p_estado: estado
    });

    if (error) {
      throw new Error(`Error de Supabase: ${error.message}`);
    }

    // Cálculo de la paginación basado en el count(*) de la base de datos
    const totalCount = data && data.length > 0 ? Number(data[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Opcional: Limpiamos la propiedad total_count de cada registro para no ensuciar la respuesta
    const cleanData = data ? data.map(({ total_count, ...rest }) => rest) : [];

    return {
      success: true,
      data: cleanData,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize
      }
    };

  } catch (error) {
    console.error('[fetchSolicitudes] Excepción capturada:', error.message);
    // En un backend real, podrías lanzar el error para que un middleware lo maneje
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

export const updateSolicitudAcceso = async (id, data, idAprobador = null)=>{

    const { hora_inicio, hora_fin, fecha_vencimiento, estado } = data;

    // Preparamos el objeto de actualización
    const updateData = {
        hora_inicio,
        hora_fin,
        fecha_vencimiento,
        estado,
    };

    // Si tenemos un aprobador, lo asignamos
    if (idAprobador) {
        updateData.id_aprobador = idAprobador;
    }

    const { data: updatedRow, error } = await supabase
        .from('solicitud_acceso_documento')
        .update(updateData)
        .eq('id_solicitud', id)
        .select(); // Devolvemos el registro actualizado

    if (error) {
        throw new Error(`Error en base de datos: ${error.message}`);
    }

    return {
        success: true,
        data: updatedRow[0]
    };
}