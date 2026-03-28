import { calcularDiferenciasRuta, deleteProceso, eliminarRuta, getProcesos, getRuta, getRutasPaginadas, getTiposProcesos, getUnidadesTiempo, insertProceso, insertRutaProceso, updateNombreRuta, updateProceso, updateSecuenciaRuta } from "../services/process.service.js";


export const obtenerTiposProcesos = async (req, res) => {
  try {

    const tipos = await getTiposProcesos();
    return res.status(200).json(tipos);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerUnidadesTiempo = async (req, res)=>{
  try{
    const unidades = await getUnidadesTiempo();
    return res.status(200).json(unidades);

  }catch(err){
    res.status(500).json({ error: err.message });
  }
}

//Procesos

export const listarProcesos = async (req, res)=>{
  try {
    const { page, limit, id_tipo_proceso} = req.query;

    const result = await getProcesos({ 
      page: page? parseInt(page) : undefined, 
      limit: limit ? parseInt(limit): undefined ,
      id_tipo_proceso
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export const creacionProceso = async (req, res) => {
  try {
    if (!req.body.nombre) {
      return res.status(400).json({ error: "El nombre del proceso es obligatorio." });
    }

    const nuevoProceso = await insertProceso(req.body);
    
    res.status(201).json({
      message: "Proceso creado exitosamente",
      data: nuevoProceso
    });

  } catch (err) {
    const statusCode = err.message.includes("Error al crear") ? 500 : 400;
    res.status(statusCode).json({ error: err.message });
  }
};

export const actualizarProceso = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, id_tipo_proceso, unidad_tiempo } = req.body;

    const procesoActualizado = await updateProceso(id, {
      nombre,
      id_tipo_proceso,
      unidad_tiempo
    });

    return res.status(200).json({
      message: 'Proceso actualizado con éxito.',
      data: procesoActualizado
    });

  } catch (error) {

    console.error('Error al actualizar proceso:', error);
    return res.status(error.statusCode? err.statusCode : 500).json({ 
      error: error.message? error.message: 'Error al actualizar proceso'
    });

  }
};

export const eliminacionProceso = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteProceso(id);

    return res.status(200).json({
      message: 'Proceso eliminado con éxito.'
    });

  } catch (error) {

    console.error('Error al eliminar proceso:', error);
    return res.status(error.statusCode? err.statusCode : 500).json({ 
      error: error.message? error.message: 'Error interno del servidor al intentar eliminar el proceso.'
    });
  }
};

//Rutas de procesos

export const nuevaRutaProcesos = async (req, res)=>{
  try{
    const { ruta, piezas} = req.body;

    await insertRutaProceso(ruta, piezas);

    return res.status(200).json({message: "Datos recibidos exitosamente"})

  }catch(err){
    console.log(err);
    return res.status(500).json({error:"Ocurrió un error creando la ruta de procesos"});
  }
}

export const listadoRutas = async(req, res)=>{
  try{
    const {page, limit} = req.query;

    const result = await getRutasPaginadas({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });

    return res.status(200).json(result)

  }catch(err){
    console.error(err);
    return res.status(err.statusCode? err.statusCode: 500).json(err.message);
  }
}

// Controlador para el detalle (Ver/Editar)
export const obtenerRuta = async (req, res) => {
  try {
    // Es convención usar req.params.id para recursos específicos (ej. /ruta/15)
    const { id } = req.params; 
    
    const data = await getRuta(id);
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error al obtener detalle de ruta:', error);
    return res.status(error.statusCode ? error.statusCode : 500).json({ error: error.message });
  }
};

export const actualizarRutaProcesos = async (req, res)=>{
  try{
    const {id} = req.params;
    const {nombre, procesos} = req.body;
    const rutaOriginal = await getRuta(id);

    //Modificación del nombre de la ruta
    if(rutaOriginal.nombre !== nombre ) {
      const nombreActualizado = await updateNombreRuta(id, nombre)
    }

    //Modificación en la secuencia de procesos
    const ids = calcularDiferenciasRuta(rutaOriginal.procesos, procesos);
    const data = await updateSecuenciaRuta(id, ids);
    return res.status(200).json({message: "Ruta de procesos actualiza exitosamente"})
  
  }catch(error){
    console.error('Error al actualizar ruta de procesos:', error);
    return res.status(error.statusCode ? error.statusCode : 500).json({ error: error.message || 'Error al actualizar ruta de procesos:'});
  }
}

export const eliminacionRuta = async (req, res)=>{
  try{
    const {id} = req.params;
    const data = await eliminarRuta(id);

    return res.status(200).json({message: 'Ruta eliminada exitosamente'});

  }catch(err){
    console.error('Error al eliminar ruta de procesos:', error);
    return res.status(error.statusCode ? error.statusCode : 500).json({ error: error.message || 'Error al actualizar ruta de procesos:'});
  }
}