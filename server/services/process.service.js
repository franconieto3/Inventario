import { supabase } from "../config/supabase.js";

export const getTiposProcesos = async()=>{
  const { data, error } = await supabase.from('tipo_ruta').select('*').order('descripcion');
  if (error) throw error;
  return data;
}

export const getUnidadesTiempo = async ()=>{
  const { data, error } = await supabase
    .rpc('get_enum_values', { type_name: 'unidad_tiempo_enum' });

  if (error) throw error;
  else {
    return data.map(item => item.enum_value);
  }
}

//Procesos

export const getProcesos = async () => {

  const { data, error } = await supabase
    .from('proceso')
    .select('*')
    .order('id_proceso', { ascending: false });

  if (error) throw error;

  return data;
};

export const insertProceso = async (procesoData) => {

  const { nombre, unidad_tiempo } = procesoData;
  
  const { data, error } = await supabase
    .from('proceso')
    .insert([
      {
        nombre: nombre.trim(),
        unidad_tiempo: unidad_tiempo
      }
    ])
    .select();

  // Manejo de errores basado en los códigos de PostgreSQL
  if (error) {
    console.error("Error de Supabase:", error); // Útil para debugear en consola

    if (error.code === '23505') {
      throw new Error(`El proceso con el nombre "${nombre}" ya existe.`);
    }
    if (error.code === '22P02') {
      throw new Error(`La unidad de tiempo "${unidadFinal}" no es válida según el sistema.`);
    }

    throw new Error(`Error al crear el proceso: ${error.message}`);
  }

  return data[0]; 
};

export const updateProceso = async (idProceso, datosActualizados) => {
  const { nombre, unidad_tiempo } = datosActualizados;

  const { data, error } = await supabase.rpc('update_proceso', {
    p_id_proceso: idProceso,
    p_nombre: nombre,
    p_unidad_tiempo: unidad_tiempo
  });

  if (error) {
    let err = new Error();
    switch(error.code){
      case 'P0002':
        err.message = "No se encontró un proceso con el ID proporcionado.";
        err.statusCode = 404;
        break;
      case '23505':
        err.message = 'Ya existe un proceso registrado con ese nombre.' ;
        err.statusCode = 409; 
        break;
      case '22P02':
        if (error.message.includes('unidad_tiempo_enum')) {
          err.message = 'El valor para unidad_tiempo no es válido. Debe coincidir con las opciones del ENUM.' ;
          err.statusCode = 400; 
          break;
        }
      default:
        err.message = 'Error interno del servidor al intentar actualizar el proceso.';
        err.statusCode = 500; 
        break;
    }
    throw err; 
  }

  return data;
};

export const deleteProceso = async (idProceso) => {
  const { error } = await supabase.rpc('delete_proceso', {
    p_id_proceso: idProceso
  });

  if (error) {
    let err = new Error();

    switch (error.code) {
      case 'P0002': 
        err.message = 'No se encontró un proceso con el ID proporcionado para eliminar.';
        err.statusCode = 404;
        break;

      case '23503':
        err.message = 'No se puede eliminar este proceso porque está siendo utilizado por otros registros en el sistema.';
        err.statusCode = 409;
        break;

      default:
        err.message = 'Error interno del servidor al intentar eliminar el proceso.';
        err.statusCode = 500;
        break;          
    }

    throw err;
  }

  return true; // Indicador simple de éxito
};

/* --- GRAFOS DE PROCESOS --- */

export const insertGrafoProceso = async (payload) => {
  
  const { data, error } = await supabase.rpc('crear_ruta_completa', {
    payload: payload
  });

  if (error) {
    console.error("Error en BD al crear el grafo de procesos:", error);

    const err = new Error();
    err.originalError = error;

    // Manejo de errores específicos de PostgreSQL
    switch (error.code) {
      case '23505': // Unique Violation
        err.statusCode = 409;
        err.message = 'Ya existe un registro que entra en conflicto con las restricciones únicas (por ejemplo, múltiples inicios o fines).';
        break;
      case '23503': // Foreign Key Violation
        err.statusCode = 400;
        err.message = 'Uno de los procesos seleccionados no existe en la base de datos.';
        break;
      default:
        err.statusCode = 500;
        err.message = `Error inesperado al guardar el grafo: ${error.message}`;
    }
    
    throw err;
  }
  
  // Devuelve el ID de la ruta creada (v_id_ruta)
  return data;
  
};

export const getGrafoProcesos = async (idRuta) => {
  
  const { data, error } = await supabase.rpc('obtener_ruta_por_id', {p_id_ruta: idRuta});

  if (error) {
    console.error("Error en BD al obtener el grafo de procesos:", error);
    const err = new Error();
    err.statusCode = 500;
    err.message = `Error al obtener el grafo de procesos: ${error.message}`;
    throw err;
  }

  if (!data) {
    const err = new Error(`No se encontró una ruta con id ${idRuta}`);
    err.statusCode = 404;
    throw err;
  }

  return data;
};

export const updateGrafoProceso = async (idRuta, payloadDiff) => {
  const { data, error } = await supabase.rpc('actualizar_ruta_completa', {
    p_id_ruta: idRuta,
    payload: payloadDiff
  });

  if (error) {
    console.error("Error en BD al actualizar el grafo de procesos:", error);

    const err = new Error();
    err.originalError = error;

    switch (error.code) {
      case '23505': // Unique Violation
        err.statusCode = 409;
        if (error.message.includes('nombre')) {
            err.message = 'El nombre ingresado para la ruta ya existe. Por favor, elige uno distinto.';
        } else {
            err.message = 'Conflicto de restricciones únicas (por ejemplo, estás intentando asignar múltiples inicios o fines).';
        }
        break;

      case '23503': // Foreign Key Violation
        err.statusCode = 400;
        err.message = 'Error de referencia: Estás intentando asignar un proceso o un tipo de ruta que no existe en el sistema.';
        break;

      case '22P02': // Invalid Text Representation (Casteo)
      case '22023': // Invalid Parameter Value
        err.statusCode = 400;
        err.message = 'El formato de los datos enviados es incorrecto (ej. texto en lugar de número, o formato JSON inválido).';
        break;

      case 'P0002': // No Data Found (si aplica)
        err.statusCode = 404;
        err.message = 'No se encontró la ruta de procesos para actualizar.';
        break;

      default:
        err.statusCode = 500;
        err.message = `Error inesperado al actualizar el grafo: ${error.message}`;
    }
    
    throw err;
  }
  
  return true; // La función RPC devuelve VOID, por lo que retornamos true en caso de éxito
};

export const getRutasFabricacion = async () => {
  
  const { data, error } = await supabase
    .from('ruta_procesos')
    .select(`
      id_ruta,
      nombre,
      id_tipo_ruta,
      tipo_ruta(descripcion)
    `
    );

  if (error) {
    const err = new Error("Error al obtener el listado de rutas");
    err.statusCode = 500;
    throw err;
  }
  return {rutas: data};
};

export const asociarRutaPieza = async (p_id_ruta, p_ids_piezas) => {

  if (!Array.isArray(p_ids_piezas) || p_ids_piezas.length === 0) {
    const err = new Error("Debe proporcionar al menos un ID de pieza.");
    err.statusCode = 400;
    throw err;
  }

  const registrosAInsertar = p_ids_piezas.map(id_pieza => ({
      id_ruta: parseInt(p_id_ruta, 10),
      id_pieza: parseInt(id_pieza, 10)
  }));

  const { data, error } = await supabase
    .from('pieza_ruta_procesos')
    .insert(registrosAInsertar)
    .select()

  if (error) {
    console.error("[Supabase Error en asociarRutaPiezas]:", error);
    
    let errorMessage = "Ocurrió un error al asociar las piezas y la ruta especificada";
    let statusCode = 500; // Por defecto: Internal Server Error

    switch (error.code) {
      case '23503': // foreign_key_violation
        if (error.message.includes('id_pieza_fkey')) {
          errorMessage = "Una o más de las piezas especificadas no existen en la base de datos.";
        } else if (error.message.includes('id_ruta_fkey')) {
          errorMessage = "La ruta de procesos especificada no existe.";
        } else {
          errorMessage = "Fallo de integridad referencial. El registro relacionado no existe.";
        }
        statusCode = 404;
        break;
        
      case '23505': // unique_violation
        errorMessage = "Una o más de estas piezas ya tienen asignada esta ruta de procesos.";
        statusCode = 409; 
        break;
        
      case '23502': // not_null_violation
        errorMessage = "Faltan datos obligatorios para realizar la asociación.";
        statusCode = 400; 
        break;
    }
      
    const err = new Error(errorMessage);
    err.statusCode = statusCode;
    err.dbCode = error.code; 
    throw err;
  }

  return data;
};

export const desasociarRutaPieza = async (p_id_ruta, p_id_pieza) => {

  const { data, error } = await supabase
    .from('pieza_ruta_procesos')
    .delete()
    .eq('id_ruta', parseInt(p_id_ruta, 10))
    .eq('id_pieza', parseInt(p_id_pieza, 10))
    .select();

  // Manejo de errores de base de datos (ej. pérdida de conexión)
  if (error) {
    console.error("[Supabase Error en desasociarRutaPieza]:", error);
    
    const err = new Error("Ocurrió un error al intentar eliminar la asociación.");
    err.statusCode = 500; // Internal Server Error
    err.dbCode = error.code;
    throw err;
  }

  // Verificamos si realmente se eliminó algún registro
  if (!data || data.length === 0) {
    const err = new Error("La asociación entre esta pieza y ruta no existe o ya fue eliminada.");
    err.statusCode = 404; // Not Found
    throw err;
  }

  return data[0]; 
};