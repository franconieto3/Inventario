import { asociarRutaPieza, deleteProceso, desasociarRutaPieza, getGrafoProcesos, getProcesos, getRutasFabricacion, getTiposProcesos, getUnidadesTiempo, insertGrafoProceso, insertProceso, updateGrafoProceso, updateProceso,} from "../services/process.service.js";

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
    const result = await getProcesos();
    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export const creacionProceso = async (req, res) => {
  try {
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
    const { nombre, unidad_tiempo } = req.body;

    const procesoActualizado = await updateProceso(id, {
      nombre,
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

// --- GRAFOS DE PROCESOS --- //

export const nuevoGrafoProcesos = async (req, res) => {
  try {
    const payload = req.body;
    
    // Validaciones de seguridad de que el payload tiene la estructura mínima esperada
    if (!payload.ruta || !payload.ruta.nombre) {
        return res.status(400).json({ error: "El objeto 'ruta' o el 'nombre' son obligatorios." });
    }
    
    if (!Array.isArray(payload.nodos) || !Array.isArray(payload.aristas)) {
        return res.status(400).json({ error: "La estructura de nodos y aristas debe ser un array." });
    }

    // 1. Delegamos el guardado al service
    const idNuevaRuta = await insertGrafoProceso(payload);

    // 2. Retornamos la respuesta exitosa al frontend
    return res.status(201).json({ 
        message: "Grafo de procesos recibido y creado exitosamente",
        data: {
          id_ruta: idNuevaRuta
        }
    });

  } catch (err) {
    console.error('Error al crear el grafo:', err);
    return res.status(err.statusCode || 500).json({ 
        error: err.message || "Error interno del servidor al crear el grafo" 
    });
  }
};

export const obtenerGrafoProcesos = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getGrafoProcesos(id);

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error al obtener el grafo:', error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

export const actualizarGrafoProcesos = async (req, res) => {
  try {

    const { id } = req.params;
    const payloadDiff = req.body;
    
    // Validaciones de seguridad básicas
    if (!id) {
        return res.status(400).json({ error: "El ID de la ruta es obligatorio." });
    }

    if (!payloadDiff || !payloadDiff.nodos || !payloadDiff.aristas) {
        return res.status(400).json({ error: "La estructura del 'Diff' (nodos y aristas) es obligatoria." });
    }

    // Delegamos la actualización al service
    await updateGrafoProceso(id, payloadDiff);

    return res.status(200).json({ 
        message: "Grafo de procesos actualizado exitosamente."
    });

  } catch (error) {
    console.error('Error al actualizar el grafo:', error);
    return res.status(error.statusCode || 500).json({ 
        error: error.message || "Error interno del servidor al actualizar el grafo" 
    });
  }
};

export const listadoRutasFabricacion = async(req, res)=>{
  try{
    const result = await getRutasFabricacion();
    return res.status(200).json(result)

  }catch(err){
    console.error(err);
    return res.status(err.statusCode? err.statusCode: 500).json({error: err.message});
  }
}

export const asignarRutaPieza = async (req, res)=>{
    try{

      const {ruta, piezas} = req.body;
      
      const data = await asociarRutaPieza(ruta, piezas);

      // 2. Retornamos la respuesta exitosa al frontend
      return res.status(201).json({ 
        message: "Piezas y ruta de fabricación asociadas exitosamente",
        data: data
      });

    }catch(err){
      console.error(err);
      return res.status(err.statusCode? err.statusCode: 500).json({error: err.message}); 
    }
}

export const eliminarRutaPieza = async (req, res) => {
  try {
    // Si lo mandas por URL dinámica ej: /rutas-piezas/:idRuta/:idPieza
    const { idRuta, idPieza } = req.params; 

    const data = await desasociarRutaPieza(idRuta, idPieza);

    return res.status(200).json({ 
      message: "Asociación entre pieza y ruta eliminada exitosamente.",
      data: data
    });

  } catch (err) {
    console.error("[Controller Error - eliminarRutaPieza]:", err);
    
    const statusCode = err.statusCode || 500;
    
    // Mantenemos la estructura JSON para errores
    return res.status(statusCode).json({
      error: err.message || "Ocurrió un error inesperado en el servidor."
    }); 
  }
};