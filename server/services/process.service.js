import { supabase } from "../config/supabase.js";

export const getTiposProcesos = async()=>{
  const { data, error } = await supabase.from('tipo_proceso').select('*').order('descripcion');
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

export const getProcesos = async ({ page = 1, limit = 10, id_tipo_proceso }) => {

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('proceso')
    .select('*, tipo_proceso(id_tipo_proceso,descripcion)', { count: 'exact' });

  if (id_tipo_proceso) {
    query = query.eq('id_tipo_proceso', id_tipo_proceso);
  }

  const { data, count, error } = await query.range(from, to).order('id_proceso', { ascending: false });
  if (error) throw error;

  return { procesos: data, total: count, totalPages: Math.ceil(count / limit), currentPage: page };

};

export const insertProceso = async (procesoData) => {

  const { nombre, id_tipo_proceso, unidad_tiempo } = procesoData;
  
  const { data, error } = await supabase
    .from('proceso')
    .insert([
      {
        nombre: nombre.trim(),
        id_tipo_proceso: id_tipo_proceso ? parseInt(id_tipo_proceso) : null, 
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
    if (error.code === '23503') {
      throw new Error("El tipo de proceso seleccionado no existe en la base de datos.");
    }

    throw new Error(`Error al crear el proceso: ${error.message}`);
  }

  return data[0]; 
};

export const updateProceso = async (idProceso, datosActualizados) => {
  const { nombre, id_tipo_proceso, unidad_tiempo } = datosActualizados;

  const { data, error } = await supabase.rpc('update_proceso', {
    p_id_proceso: idProceso,
    p_nombre: nombre,
    p_id_tipo_proceso: id_tipo_proceso,
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
      case '23503':
        err.message = 'El tipo de proceso (id_tipo_proceso) indicado no existe.';
        err.statusCode = 400; 
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

export const insertRutaProceso = async (ruta, piezas)=>{

  const payload = {
    piezas: Array.isArray(piezas) ? piezas : []
  }

  if(ruta.nombre && ruta.procesos) {
    payload.nombre = ruta.nombre
    payload.procesos = Array.isArray(ruta.procesos) ? ruta.procesos : [];
  }

  if(ruta.id_bop) payload.id_bop = ruta.id_bop;
  
  const {data, error} = await supabase.rpc('crear_ruta_proceso', {payload});
  
  if (error) {
    console.error("Error BD al crear ruta:", error); // Útil para tus logs internos

    switch (error.code) {
      case '23505': // Unique Violation
        if (error.message.includes('nombre')) {
          const err = new Error("Ya existe una Hoja de Procesos (BOP) con ese nombre. Por favor, elige uno distinto.");
          err.statusCode = 400;
          throw err;
        }
        const errDup = new Error("Registro duplicado en la base de datos.");
        errDup.statusCode = 400;
        throw errDup;

      case '23503': // Foreign Key Violation
        const errFk = new Error("Referencia inválida. Es posible que el ID de la ruta, el proceso o la pieza ya no existan en el sistema.");
        errFk.statusCode = 400;
        throw errFk;

      case '23502': // Not Null Violation
        const errNull = new Error("Faltan datos obligatorios. Verifica que todos los procesos tengan su 'orden_secuencia' y las piezas su 'id_pieza'.");
        errNull.statusCode = 400;
        throw errNull;

      case '22P02': // Invalid Text Representation (Casteo)
      case '22023': // Invalid Parameter Value
        const errType = new Error("Error en el formato de los datos. Asegúrate de que los IDs y valores numéricos estén correctos.");
        errType.statusCode = 400;
        throw errType;

      default:
        // Error genérico por si ocurre algo inesperado (ej. pérdida de conexión)
        const errGen = new Error(`Error inesperado al guardar la ruta: ${error.message || 'Error desconocido'}`);
        errGen.statusCode = 500;
        throw errGen;
    }
  }
  
  return data;
} 

export const updateRuta = async(ruta)=>{
  //Se puede modificar el nombre
  //Se puede modificar la secuencia de procesos: modificando el orden de la secuencia o si el proceso requiere controles de calidad
  //Se pueden agregar pasos a la secuencia de procesos
  //Se pueden eliminar pasos de la secuencia de procesos
}