import { moverArchivoAPermanente, signedUploadUrl } from "../services/document.service.js";
import { crearCategoria, crearInstrumento, crearRelacionPiezaInstrumento, darDeBaja, deleteCategoria, deleteInstrumento, editarCategoria, eliminarRelacionPiezaInstrumento, getCategorias, getInstrument, getInstrumentos, getSectores, insertarRegistroArchivo, obtenerArchivosPorInstrumento, obtenerPrimerDiaDelMes, obtenerVerificacionesPorInstrumento, updateInstrumento } from "../services/instruments.service.js";


export const nuevoInstrumento = async (req, res) => {
    try {
        const data = req.body;

        const fechaNormalizada = obtenerPrimerDiaDelMes(data.mes_vencimiento);
        data.mes_vencimiento = fechaNormalizada;

        // Llamada al servicio
        const nuevoInstrumento = await crearInstrumento(data);

        // Respuesta exitosa
        return res.status(201).json({
            message: "Instrumento creado con éxito",
            data: nuevoInstrumento
        });

    } catch (error) {
        // Capturamos los errores lanzados desde el service y devolvemos un 400
        console.error("Error en crearInstrumento controller:", error.message);
        return res.status(error.statusCode || 500).json({ 
            message: error.message || "Error interno del servidor al procesar la solicitud" 
        });
    }
};

export const nuevaCategoria = async (req, res)=>{
    try{
        const data = req.body;
        
        // Llamada al servicio
        const nuevaCategoria = await crearCategoria(data);

        // Respuesta exitosa
        return res.status(201).json({
            message: "Categoria creada con éxito",
            data: nuevaCategoria
        });

    } catch (error) {
        // Capturamos los errores lanzados desde el service y devolvemos un 400
        console.error("Error en crearInstrumento controller:", error.message);
        return res.status(error.statusCode || 400).json({ 
            message: error.message || "Error interno del servidor al procesar la solicitud" 
        });
    }
}

export const edicionCategoria = async (req, res) => {
    try {
        const { id } = req.params; // Obtenemos el ID desde los parámetros de la URL
        const data = req.body;     // Obtenemos el payload del frontend

        // Llamada al servicio
        const categoriaActualizada = await editarCategoria(id, data);

        // Respuesta exitosa
        return res.status(200).json({
            message: "Categoría actualizada con éxito",
            data: categoriaActualizada
        });

    } catch (error) {
        console.error("Error en edicionCategoria controller:", error.message);
        
        // Devolvemos el error al frontend para que lo muestre en la interfaz
        return res.status(error.statusCode || 500).json({ 
            message: error.message || "Error interno del servidor al actualizar la categoría" 
        });
    }
}

export const borrarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Llamada al servicio
        await deleteCategoria(id);

        // Respuesta exitosa
        return res.status(200).json({ message: "Categoría eliminada exitosamente" });

    } catch (err) {
        console.error("Error en borrarCategoria controller:", err);
        return res.status(err.statusCode || 500).json({ 
            message: err.message || "Ocurrió un error al intentar eliminar la categoría" 
        });
    }
};

export const sectores = async (req, res) => {
    try {
      const sectores = await getSectores();
      return res.status(200).json(sectores);
    } catch (error) {
      console.error('[InstrumentosController.getSectores]', error);
      return res.status(500).json({ error: 'Error interno del servidor al cargar sectores' });
    }
}

export const instrumentos = async (req, res) => {
    try {
      // Extraemos y parseamos los query params recibidos desde el Hook de React
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { tipo, sectorId, estado } = req.query;
    
      // Llamamos al servicio con los parámetros limpios
      const result = await getInstrumentos({
        page,
        limit,
        tipo,
        sectorId: sectorId ? parseInt(sectorId) : undefined,
        estado
      });

      // Retornamos el objeto con { items, total } que espera tu hook useInstruments
      return res.status(200).json({
        ...result,
        //items: itemsConEstado
        });

    } catch (error) {
      console.error('[InstrumentosController.getInstrumentos]', error);
      return res.status(error.statusCode || 500).json({ error: 'Error interno del servidor al cargar instrumentos' });
    }
  }

export const categorias = async(req, res)=>{
    try{
        const data = await getCategorias();
        return res.status(200).json(data)

    }catch(err){
        return res.status(err.statusCode || 500).json({ error: 'Error interno del servidor al cargar instrumentos' });
    }
}

export const actualizarInstrumento = async (req, res) => {
    try {
        const { id } = req.params; // ID que viene en la URL
        const data = req.body;     // Datos validados por Zod

        const fecha_normalizada = obtenerPrimerDiaDelMes(data.mes_vencimiento);
        data.mes_vencimiento = fecha_normalizada;

        // Llamada al servicio
        const instrumentoActualizado = await updateInstrumento(id, data);

        // Respuesta exitosa
        return res.status(200).json({
            message: "Instrumento actualizado con éxito",
            data: instrumentoActualizado
        });

    } catch (error) {
        console.error("Error en actualizarInstrumento controller:", error.message);
        return res.status(error.statusCode || 500).json({ 
            message: error.message || "Error interno del servidor al actualizar el instrumento" 
        });
    }
};

export const borrarInstrumento = async (req, res)=>{
    try{
        const {id} = req.params;
        const data = await deleteInstrumento(id);

        return res.status(200).json({message: "Instrumento eliminado exitosamente"});

    }catch(err){
        return res.status(err.statusCode? err.statusCode : 500).json({message: err.message || "Ocurrió un error al eliminar el instrumento"});
    }
}

export const instrumento = async (req, res)=>{
    try{
        const {id} = req.params;
        const data = await getInstrument(id);
        return res.status(200).json(data);

    }catch(err){
        return res.status(err.statusCode || 500).json({message: err.message});
    }
}

export const baja = async (req, res)=>{
    try{
        const {id} = req.params;

        const data = await darDeBaja(id);    
        
        return res.status(200).json({message: "Instrumento dado de baja exitosamente"});
        
    }catch(err){
        return res.status(err.statusCode || 500).json({error: err.message});
    }
}

//Verificaciones

export const archivoTemporal = async (req, res)=>{
    try{
        const {fileName, fileType, fileSize} = req.body;

        //Creación de path temporal(servicio) 
        const path = `temp/${Date.now()}-${fileName}`;

        //Generación de url de carga
        const data = await signedUploadUrl(path);

        return res.json({
            signedUrl: data.signedUrl,
            uploadToken: data.token,
            path: path
        });

    }catch(err){
        console.log(err);
        return res.status(err.statusCode || 500).json({error: "Ocurrió un error"})
    }
}

export const guardarVerificacion = async(req, res)=>{
    try{
        const {id} = req.params;
        const {date, path} = req.body;

        //Path temporal
        const tempPath = path;

        //Definicion del path final
        const finalPath = `certificaciones/instrumentos/${id}/${path.split('/').pop()}`

        //Mover archivo
        const data = await moverArchivoAPermanente(tempPath, finalPath);

        const payload = {
            id_instrumento: id,
            fecha_verificacion: obtenerPrimerDiaDelMes(date),
            path: finalPath    
        };

        //Guardar datos en DB
        const idVerificacion = await insertarRegistroArchivo(payload, 'verificaciones');

        //Respuesta exitosa
        return res.status(201).json({
            message: "Documento y versión creados exitosamente",
            id_verificacion: idVerificacion
        })
        
    }catch(err){
        console.log(err);
        return res.status(err.statusCode || 500).json({ error: err.message || "Ocurrió un error guardando el archivo de verificación"});  
    }
}

export const getVerificacionesPorInstrumento = async (req, res) => {
    try {
        const { idInstrumento } = req.params;

        const verificaciones = await obtenerVerificacionesPorInstrumento(idInstrumento);

        return res.status(200).json({
            success: true,
            data: verificaciones
        });

    } catch (error) {
        console.error("Error en getVerificacionesPorInstrumento Controller:", error);
        
        return res.status(err.statusCode || 500).json({
            success: false,
            message: "Ocurrió un error en el servidor al intentar obtener las verificaciones."
        });
    }
};

//Archivos auxiliares

export const guardarArchivoInstrumento = async(req, res)=>{
    try{
        const {id} = req.params;
        const {path, tipoDocumento} = req.body;

        //Path temporal
        const tempPath = path;

        //Definicion del path final
        const finalPath = `instrumentos/${id}/${path.split('/').pop()}`

        //Mover archivo
        const data = await moverArchivoAPermanente(tempPath, finalPath);

        const payload = {
            id_instrumento: id,
            path: finalPath,   
            tipo_documento: tipoDocumento
        };

        //Guardar datos en DB
        const idArchivo = await insertarRegistroArchivo(payload, 'instrumentos_archivos');

        //Respuesta exitosa
        return res.status(201).json({
            message: "Archivo guardado exitosamente",
            id_archivo: idArchivo
        })
        
    }catch(err){
        console.log(err);
        return res.status(err.statusCode || 500).json({ error: err.message || "Ocurrió un error guardando el archivo"});  
    }
}

export const getArchivosPorInstrumento = async (req, res) => {
    try {
        const { idInstrumento } = req.params;

        const archivos = await obtenerArchivosPorInstrumento(idInstrumento);

        return res.status(200).json({
            success: true,
            data: archivos
        });

    } catch (error) {
        console.error("Error en getArchivosPorInstrumento Controller:", error);
        
        return res.status(err.statusCode || 500).json({
            success: false,
            message: "Ocurrió un error en el servidor al intentar obtener los archivos adjuntos."
        });
    }
};

//Asociación con piezas

export const agregarPiezaInstrumento = async (req, res) => {
    try {
        const { piezas, elementos} = req.body;
        
        const nuevasRelaciones = await crearRelacionPiezaInstrumento(piezas, elementos);
        
        return res.status(201).json({
            success: true,
            message: 'Relaciones pieza-instrumento creada exitosamente',
            data: nuevasRelaciones
        });

    } catch (error) {

        return res.status(err.statusCode || 500).json({
            success: false,
            message: 'Error al crear la relación en la base de datos',
            error: error.message
        });
    }
};

export const eliminarPiezaInstrumento = async (req, res) => {
    try {
        const { id_pieza, id_categoria_instrumento } = req.params;

        const dataEliminada = await eliminarRelacionPiezaInstrumento(id_pieza, id_categoria_instrumento);

        // Si el array está vacío, la relación no existía
        if (dataEliminada.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la relación pieza-instrumento para eliminar'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Relación pieza-instrumento eliminada correctamente',
            data: dataEliminada[0]
        });

    } catch (error) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: 'Error al intentar eliminar la relación',
            error: error.message
        });
    }
};