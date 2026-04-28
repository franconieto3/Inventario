import { moverArchivoAPermanente, signedUploadUrl } from "../services/document.service.js";
import { crearCategoria, crearInstrumento, darDeBaja, deleteInstrumento, getCategorias, getInstrument, getInstrumentos, getSectores, insertarVerificacion, obtenerVerificacionesPorInstrumento, updateInstrumento } from "../services/instruments.service.js";


export const nuevoInstrumento = async (req, res) => {
    try {
        const data = req.body;

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
        return res.status(400).json({ 
            message: error.message || "Error interno del servidor al procesar la solicitud" 
        });
    }
};

export const nuevaCategoria = async (req, res)=>{
    try{
        const data = req.body;

        console.log('Data: ', data);
        
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
        return res.status(400).json({ 
            message: error.message || "Error interno del servidor al procesar la solicitud" 
        });
    }
}

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
      return res.status(500).json({ error: 'Error interno del servidor al cargar instrumentos' });
    }
  }

export const categorias = async(req, res)=>{
    try{
        const data = await getCategorias();
        return res.status(200).json(data)

    }catch(err){
        return res.status(500).json({ error: 'Error interno del servidor al cargar instrumentos' });
    }
}

export const actualizarInstrumento = async (req, res) => {
    try {
        const { id } = req.params; // ID que viene en la URL
        const data = req.body;     // Datos validados por Zod

        // Llamada al servicio
        const instrumentoActualizado = await updateInstrumento(id, data);

        // Respuesta exitosa
        return res.status(200).json({
            message: "Instrumento actualizado con éxito",
            data: instrumentoActualizado
        });

    } catch (error) {
        console.error("Error en actualizarInstrumento controller:", error.message);
        return res.status(400).json({ 
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
        return res.status(err.statusCode).json({message: err.message});
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

export const agregarVerificacion = async (req, res)=>{
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
        return res.status(500).json({error: "Ocurrió un error"})
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
            fecha_verificacion: date,
            path: finalPath    
        };

        //Guardar datos en DB
        const idVerificacion = await insertarVerificacion(payload);

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
        
        return res.status(500).json({
            success: false,
            message: "Ocurrió un error en el servidor al intentar obtener las verificaciones."
        });
    }
};