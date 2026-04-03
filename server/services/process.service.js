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

//Rutas de procesos

export const insertRutaProceso = async (ruta, piezas)=>{

  const payload = {
    piezas: Array.isArray(piezas) ? piezas.map((p)=>({id_pieza: p})) : []
  }

  if(ruta.nombre && ruta.procesos) {
    payload.nombre = ruta.nombre;
    payload.id_tipo_ruta = Number(ruta.id_tipo_ruta);
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

export const getRutasPaginadas = async () => {

  // Solo traemos lo esencial para la tabla: id y nombre
  const { data, error } = await supabase
    .from('bill_of_process')
    .select(`
      id_bop,
      nombre,
      id_tipo_ruta,
      tipo_ruta(descripcion),
      proceso_bop(
        id_proceso_ruta,
        orden_secuencia,
        requiere_inspeccion,
        proceso(
          id_proceso,
          nombre,
          unidad_tiempo
        )
      )
       `
    )
    .order('id_bop', { ascending: false });

  if (error) {
    const err = new Error("Error al obtener el listado de rutas");
    err.statusCode = 500;
    throw err;
  }
  return {rutas: data};
};


export const getRuta = async (idBop)=>{

  const {data, error} = await supabase
    .from('bill_of_process')
    .select(`
      id_bop,
      nombre,
      id_tipo_ruta,
      tipo_ruta(descripcion),
      proceso_bop(
        id_proceso_ruta,
        orden_secuencia,
        requiere_inspeccion,
        proceso(
          id_proceso,
          nombre,
          unidad_tiempo
        )
      )
       `)
    .eq('id_bop', idBop)
    .single();

  if(error){
    const err = new Error("Ocurrió un error obteniendo la ruta");
    err.statusCode = 500;
    throw err;
  }
  /*
  const res = {
    id_bop: data.id_bop,
    nombre: data.nombre,
    procesos: data.proceso_bop.map(
      (p)=>{
        return {
          id_proceso: p.proceso.id_proceso,
          id_proceso_ruta: p.id_proceso_ruta,
          orden_secuencia: p.orden_secuencia,
          requiere_inspeccion: p.requiere_inspeccion
        }
      }
    )
  }
*/
  return data;
}


export function calcularDiferenciasRuta(estadoOriginal, estadoNuevo) {
    const idsToDelete = [];
    const updates = [];
    const inserts = [];

    // 1. Crear un mapa del estado NUEVO para búsquedas rápidas por id_proceso_ruta
    const mapaNuevo = new Map();
    estadoNuevo.forEach(item => {
        // Solo mapeamos los que ya existían (tienen id_proceso_ruta)
        if (item.id_proceso_ruta) {
            mapaNuevo.set(item.id_proceso_ruta, item);
        }
    });
    
    // 2. Detectar ELIMINACIONES (Están en el original, pero no en el nuevo)
    estadoOriginal.forEach(itemOriginal => {
        if (!mapaNuevo.has(itemOriginal.id_proceso_ruta)) {
            idsToDelete.push(itemOriginal.id_proceso_ruta);
        }
    });
    
    // 3. Detectar INSERCIONES y ACTUALIZACIONES
    estadoNuevo.forEach((itemNuevo, index) => {
        // Normalizamos el valor del checkbox manejando la diferencia de nombres (UI vs BD)
        const requiere_inspeccion = itemNuevo.requiere_inspeccion !== undefined 
            ? itemNuevo.requiere_inspeccion 
            : itemNuevo.requiere_inspeccion;

        // El orden de secuencia real es el índice del array + 1
        const ordenSecuenciaReal = index + 1;

        if (!itemNuevo.id_proceso_ruta) {
            // A. Es una INSERCIÓN: No tiene id_proceso_ruta
            inserts.push({
                id_proceso: itemNuevo.id_proceso,
                orden_secuencia: ordenSecuenciaReal,
                requiere_inspeccion: requiere_inspeccion
            });
        } else {
            // B. Es una ACTUALIZACIÓN potencial: Ya existía, verificamos si cambió algo
            const itemOriginal = estadoOriginal.find(o => o.id_proceso_ruta === itemNuevo.id_proceso_ruta);

            if (itemOriginal) {
                const cambioOrden = itemOriginal.orden_secuencia !== ordenSecuenciaReal;
                const cambioInspeccion = itemOriginal.requiere_inspeccion !== requiere_inspeccion;

                if (cambioOrden || cambioInspeccion) {
                    updates.push({
                        id_proceso_ruta: itemNuevo.id_proceso_ruta,
                        orden_secuencia: ordenSecuenciaReal,
                        requiere_inspeccion: requiere_inspeccion
                    });
                }
            }
        }
    });
    return {
        p_ids_to_delete: idsToDelete.length > 0 ? idsToDelete : null,
        p_updates: updates.length > 0 ? updates : null,
        p_inserts: inserts.length > 0 ? inserts : null
    };
}

export const updateNombreRuta = async (idBop, nombre)=>{
  const {data, error} = await supabase.rpc('update_nombre_bop',{
    p_id_bop: idBop,
    p_nombre: nombre
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error('El nombre ingresado ya existe en otro registro. Por favor, elige otro.');
    }
    throw new Error(`Error inesperado al actualizar el nombre: ${error.message}`);
  }

  if (data === false) {
    throw new Error('No se encontró el BOP para actualizar.');
  }

  return data;
}

export const updateSecuenciaRuta = async(idBop, payload)=>{

  const {data, error} = await supabase.rpc('update_secuencia_bop',{
    p_id_bop: idBop,
    p_ids_to_delete: payload.p_ids_to_delete || [], 
    p_inserts: payload.p_inserts || [],
    p_updates: payload.p_updates || []        
  })

if (error) {
    // Creamos un error personalizado según el código devuelto por Postgres
    const err = new Error();
    err.originalError = error;

    switch (error.code) {
      case '23503':
        err.message = 'Error de referencia: Estás intentando asignar un proceso que no existe o eliminar uno en uso.';
        break;
      case '23505':
        err.message = 'Error de duplicado: El proceso o el orden de secuencia ya existe en este BOP.';
        break;
      case '23502':
        err.message = 'Faltan datos obligatorios en los procesos enviados.';
        break;
      case '22P02':
      case '22023':
        err.message = 'El formato de los datos enviados es incorrecto (ej. texto en lugar de número).';
        break;
      default:
        err.message = `Error inesperado al actualizar el BOP: ${error.message}`;
    }
    
    throw err;
  }

  return data;
} 

export const eliminarRuta = async (idBop) => {

  const { data, error } = await supabase
    .from('bill_of_process')
    .delete()
    .eq('id_bop', idBop)
    .select();

  if (error) {
    let err = new Error();

    switch (error.code) {
      case '23503':
        err.message = 'No se puede eliminar esta ruta de procesos porque está siendo utilizado por otros registros en el sistema.';
        err.statusCode = 409;
        break;

      default:
        err.message = 'Error interno del servidor al intentar eliminar la ruta.';
        err.statusCode = 500;
        break;
    }

    throw err;
  }

  if (!data || data.length === 0) {
    const err = new Error('No se encontró una ruta de procesos con el ID proporcionado para eliminar.');
    err.statusCode = 404;
    throw err;
  }

  return true;
};