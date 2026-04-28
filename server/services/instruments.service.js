import { supabase } from "../config/supabase.js";


export const crearInstrumento = async (data) => {
    // 1. Construimos el payload base asegurándonos de convertir strings vacíos a null
    const payload = {
        marca: data.marca || null,
        modelo: data.modelo || null,
        nro_serie: data.nro_serie || null,
        sector: data.sector ? parseInt(data.sector, 10) : null,
        mes_vencimiento: data.mes_vencimiento || null,
        id_categoria: data.categoria || null
    };

    // 3. Inserción en Supabase
    const { data: nuevoInstrumento, error } = await supabase
        .from('instrumentos')
        .insert([payload])
        .select()
        .single(); // Devuelve un solo objeto en lugar de un array

    // 4. Manejo de Errores Específicos de PostgreSQL/Supabase
    if (error) {
        if (error.code === '23503') {
            throw new Error(`Error: El sector asignado no existe en la base de datos.`);
        }

        // Código 22P02: Sintaxis de entrada inválida (ej. texto donde va un número o enum inválido)
        if (error.code === '22P02') {
            throw new Error("Error: El formato de los datos es incorrecto. Verifique los tipos de proveedor, instrumento y fechas.");
        }

        // Error por defecto de Supabase
        throw new Error(error.message || "Ocurrió un error inesperado al guardar el instrumento en la base de datos.");
    }

    return nuevoInstrumento;
};

export const crearCategoria = async (data) =>{
    // 1. Construimos el payload base asegurándonos de convertir strings vacíos a null
    const payload = {
        tipo: data.tipo,
        descripcion: data.descripcion,
        tipo_proveedor: data.tipo_proveedor,
        frecuencia_meses: parseInt(data.frecuencia_meses, 10)
    };

    // 2. Aplicamos la lógica de negocio y limpiamos según el TIPO 
    if (data.tipo === 'ESTANDAR') {
        // El constraint chk_probador_requerimientos exige esto para ESTANDAR:
        payload.usos_maximos = null; 

    } else if (data.tipo === 'PROBADOR') {
        payload.usos_maximos = parseInt(data.usos_maximos, 10);
    }

    console.log('Payload: ', payload);

    // 3. Inserción en Supabase
    const { data: nuevoInstrumento, error } = await supabase
        .from('categoria_instrumento')
        .insert([payload])
        .select()
        .single(); // Devuelve un solo objeto en lugar de un array

    // 4. Manejo de Errores Específicos de PostgreSQL/Supabase
    if (error) {
        // Código 23514: Violación de Check Constraint
        if (error.code === '23514') {
            if (error.message.includes('chk_estandar_requerimientos')) {
                throw new Error("Error de validación: Los instrumentos ESTANDAR requieren proveedor y frecuencia en meses.");
            }
            if (error.message.includes('chk_probador_requerimientos')) {
                throw new Error("Error de validación: Los instrumentos PROBADOR requieren definir los usos máximos.");
            }
            throw new Error("Error: Los datos enviados no cumplen con las restricciones de la base de datos.");
        }

        // Código 22P02: Sintaxis de entrada inválida (ej. texto donde va un número o enum inválido)
        if (error.code === '22P02') {
            throw new Error("Error: El formato de los datos es incorrecto. Verifique los tipos de proveedor, instrumento y fechas.");
        }

        // Error por defecto de Supabase
        throw new Error(error.message || "Ocurrió un error inesperado al guardar el instrumento en la base de datos.");
    }

    return nuevoInstrumento;    
}

// Obtener todos los sectores
export const getSectores = async ()=>{
    const { data, error } = await supabase
      .from('sector')
      .select('id_sector, descripcion, created_at')
      .order('descripcion', { ascending: true });

    if (error) throw new Error(`Error al obtener sectores: ${error.message}`);
    return data;
}


export const getInstrumentos = async ({ page = 1, limit = 10, tipo, sectorId, estado }) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Usamos el RPC en lugar de la tabla. 
    // Pedimos el count exacto para mantener la paginación de tu frontend.
    let query = supabase
      .rpc('get_instrumentos_con_estado', {}, { count: 'exact' })
      .select('*'); // <-- Solo pedimos todo, el RPC ya hace el trabajo pesado  

    // Filtros
    if (tipo) query = query.eq('tipo', tipo);
    if (sectorId) query = query.eq('sector', sectorId);
    if (estado) query = query.eq('estado', estado); // Filtramos por el estado calculado

    // Ordenamiento
    if (tipo === 'ESTANDAR') {
      query = query.order('mes_vencimiento', { ascending: false, nullsFirst: false });
    } else if (tipo === 'PROBADOR') {
      query = query.order('usos_actuales', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Paginación
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw new Error(`Error al obtener instrumentos mediante RPC: ${error.message}`);

    return {
      items: data,
      total: count
    };
  }

  export const getCategorias = async ()=>{
    const {data, error} = await supabase
        .from('categoria_instrumento')
        .select('*');

    if (error) throw new Error(`Error al obtener instrumentos mediante RPC: ${error.message}`);

    return data;
  }

  export const updateInstrumento = async (id, data) => {

    const payload = {
        marca: data.marca !== undefined ? data.marca : null,
        modelo: data.modelo !== undefined ? data.modelo : null,
        nro_serie: data.nro_serie !== undefined ? data.nro_serie : null,
        mes_vencimiento: data.mes_vencimiento !== undefined ? data.mes_vencimiento : null,
        sector: data.sector !==undefined ? data.sector : null
    };

    // 3. Actualización en Supabase
    const { data: instrumentoActualizado, error } = await supabase
        .from('instrumentos')
        .update(payload)
        .eq('id_instrumento', id) // Asegúrate de que el Primary Key se llame id_instrumento en tu DB
        .select()
        .single();

    // 4. Manejo de Errores
    if (error) {

        // Sintaxis de entrada inválida
        if (error.code === '22P02') {
            throw new Error("Error: El formato de los datos es incorrecto. Verifique los campos ingresados.");
        }

        throw new Error(error.message || "Ocurrió un error inesperado al actualizar el instrumento.");
    }

    if (!instrumentoActualizado) {
        throw new Error("Instrumento no encontrado o no se pudo actualizar.");
    }

    return instrumentoActualizado;
};

export const deleteInstrumento = async (id)=>{
  const { data, error } = await supabase
    .from('instrumentos')
    .delete()
    .eq('id_instrumento', id)
    .select(); 
  
  if (error) {
    // Manejo de Foreign Key constraint (el instrumento está en uso)
    if (error.code === '23503') {
        throw { statusCode: 409, message: "No se puede eliminar: el instrumento tiene registros asociados." };
    }
    throw { statusCode: 500, message: "Ocurrió un error en la base de datos al eliminar." }; 
  }

  // Verificar si realmente se borró algo
  if (!data || data.length === 0) {
    throw { statusCode: 404, message: "Instrumento no encontrado o ya fue eliminado." };
  }

  return data;
}

export const getInstrument = async (id)=>{

    const {data, error} = await supabase.rpc('get_instrumentos_con_estado', {p_id_instrumento: id})
    .single();

    if(error){
        console.log(error);
        throw { statusCode: 500, message: "Ocurrió un error, no se encontró el instrumento solicitado" };
    }

    return data;
}


export const darDeBaja = async (idInstrumento)=>{
    const {data, error} = await supabase
    .from('instrumentos')
    .update({ 
        activo: false
    })
    .eq('id_instrumento', idInstrumento);

    if(error) throw new Error({statusCode: 500, message: 'Ocurrió un error. No se pudo dar de baja el instrumento seleccionado'});

    return data;
}

//Verificaciones

export const insertarVerificacion = async (payload)=>{
    const {data, error} = await supabase
    .from('verificaciones')
    .insert(payload)

    if(error){
        console.log(err);
        throw new Error({statusCode: 500, message: "Ocurrió un error. No se pudo guardar el archivo de verificación"})
    }

    return data;
}

export const obtenerVerificacionesPorInstrumento = async (idInstrumento) => {
    // 1. Validación de entrada
    if (!idInstrumento) throw new Error("El ID del instrumento es requerido.");

    const { data, error } = await supabase
        .from('verificaciones')
        .select('*')
        .eq('id_instrumento', idInstrumento)
        .order('fecha_verificacion', { ascending: false });

    // 3. Manejo de Errores de Red/Base de Datos
    if (error) {
        console.error("Error Supabase:", error.message);
        throw new Error("Error al obtener las verificaciones del instrumento.");
    }

    return data || []; 
};