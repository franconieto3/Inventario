import { supabase } from "../config/supabase.js";


const throwServiceError = (statusCode, message, errorDetails = null) => {
    throw { statusCode, message, details: errorDetails };
};

//Listado de usuarios:

export const getUserList = async () => {

    const { data, error } = await supabase
        .from('usuarios')
        .select(`
            id_usuario,
            dni,
            name,
            email,
            telefono,
            estado_usuario:estado_usuario (id_estado_usuario, descripcion),
            sectores:sector (id_sector, descripcion),
            roles:rol (id_rol, descripcion, nivel)
        `);

    if (error) {
        throwServiceError(500, "Ocurrió un error obteniendo el listado de usuarios", error.message);
    }

    return { data };
}

//Dar de baja usuarios

export const deactivateUser = async (id_usuario) => {

    const { data, error } = await supabase.rpc('dar_de_baja_usuario', { p_id_usuario: id_usuario });

    if (error) {
        throwServiceError(500, "Ocurrió un error al intentar dar de baja al usuario", error.message);
    }

    if (!data) {
        throwServiceError(404, "El usuario que intenta dar de baja no existe.");
    }

    return { message: "Usuario dado de baja con éxito y sus relaciones fueron removidas." };
}

//Listado de roles

export const getRolList = async () => {
    // Join con la tabla M2M de permisos
    const { data, error } = await supabase
        .from('rol')
        .select(`
            *,
            permisos:permiso (id_permiso, descripcion)
        `)
        .order('descripcion', { ascending: true });

    if (error) {
        throwServiceError(500, "Ocurrió un error obteniendo el listado de roles", error.message);
    }

    return { data };
}

// Listado de permisos: permanece igual
export const getPermissionList = async ()=>{
    const {data, error} = await supabase.from('permiso').select('*').order('descripcion', { ascending: true });;

    if (error){
        throw new Error({statusCode: 500, message: "Ocurrió un error obteniendo el listado de permisos"});
    }

    return {data};
}

// Listado de estados de usuario:
export const getUserStatusList = async ()=>{
    const {data, error} = await supabase.from('estado_usuario').select('*').order('descripcion', { ascending: true });;

    if (error){
        throw new Error({statusCode: 500, message: "Ocurrió un error obteniendo el listado de estados de usuario"});
    }

    return {data};
}

//Creación de roles

export const createRole = async (roleData) => {
    // roleData debería tener al menos { descripcion: "..." }
    const { data, error } = await supabase
        .from('rol')
        .insert([roleData])
        .select();

    if (error) {
        if (error.code === '23505') throwServiceError(409, "El rol ya existe. La descripción está duplicada.", error.message);
        throwServiceError(500, "Ocurrió un error creando el rol", error.message);
    }

    return { data: data[0] };
}

//Edición de roles

export const updateRole = async (id_rol, roleData) => {
    const { data, error } = await supabase
        .from('rol')
        .update(roleData)
        .eq('id_rol', id_rol)
        .select();

    if (error) {
        if (error.code === '23505') throwServiceError(409, "Ya existe otro rol con esa descripción.", error.message);
        throwServiceError(500, "Ocurrió un error editando el rol", error.message);
    }

    if (!data || data.length === 0) {
        throwServiceError(404, "El rol que intenta editar no existe.");
    }

    return { data: data[0] };
}

//Eliminación de roles

export const deleteRole = async (id_rol) => {
    const { data, error } = await supabase
        .from('rol')
        .delete()
        .eq('id_rol', id_rol)
        .select();

    if (error) {
        // Violación de Foreign Key (Ej: El rol sigue asignado a usuarios o permisos)
        if (error.code === '23503') throwServiceError(400, "No se puede eliminar el rol porque está actualmente en uso por uno o más usuarios/permisos.", error.message);
        throwServiceError(500, "Ocurrió un error eliminando el rol", error.message);
    }

    if (!data || data.length === 0) {
        throwServiceError(404, "El rol que intenta eliminar no existe.");
    }

    return { data: data[0] };
}


//Asignar un nuevo sector a un usuario

export const assignSectorToUser = async (id_usuario, id_sector) => {
    const { data, error } = await supabase
        .from('usuario_sector')
        .insert([{ id_usuario, id_sector }])
        .select();

    if (error) {
        if (error.code === '23505') throwServiceError(409, "El usuario ya tiene asignado este sector.", error.message);
        if (error.code === '23503') throwServiceError(404, "El usuario o el sector indicado no existe.", error.message);
        throwServiceError(500, "Ocurrió un error asignando el sector al usuario", error.message);
    }

    return { data: data[0] };
}

//Eliminar un sector de un usuario

export const removeSectorFromUser = async (id_usuario, id_sector) => {
    const { data, error } = await supabase
        .from('usuario_sector')
        .delete()
        .match({ id_usuario, id_sector }) // Filtramos por la clave primaria compuesta
        .select();

    if (error) {
        throwServiceError(500, "Ocurrió un error desasignando el sector del usuario", error.message);
    }

    // Si data vuelve vacío, significa que no se encontró esa relación para eliminar
    if (!data || data.length === 0) {
        throwServiceError(404, "La relación entre el usuario y el sector indicado no existe.");
    }

    return { data: data[0] };
}

/*Relacionar roles a un usuario */

export const miMaximoNivel = (solicitante)=>{
    if (!solicitante?.roles || solicitante.roles.length === 0) return 999;
    return Math.min(...solicitante.roles.map(r => r.nivel));
}

export const updateUserRoles = async (id_usuario, rolesAgregar = [], rolesQuitar = []) => {
    // Llamada al RPC enviando los arrays directamente
    const { data, error } = await supabase.rpc('actualizar_roles_usuario', {
        p_id_usuario: id_usuario,
        p_roles_agregar: rolesAgregar,
        p_roles_quitar: rolesQuitar
    });

    if (error) {
        // En caso de que se dispare el bloque EXCEPTION del RPC o falle la red
        throwServiceError(500, "Ocurrió un error al actualizar los roles del usuario", error.message);
    }

    return { message: "Roles actualizados con éxito." };
}
