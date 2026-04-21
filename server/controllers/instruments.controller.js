import { crearInstrumento, deleteInstrumento, getInstrument, getInstrumentos, getSectores, updateInstrumento } from "../services/instruments.service.js";


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