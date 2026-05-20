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

export const createRole = async (nombre, nivel, permisos) => {
    // roleData debería tener al menos { descripcion: "..." }
    const { data, error } = await supabase.rpc('crear_rol', {
        p_nombre: nombre,
        p_nivel: nivel,
        p_permisos: permisos
    })

    if (error) {
        if (error.code === '23505') throwServiceError(409, "El rol ya existe. La descripción está duplicada.", error.message);
        throwServiceError(500, "Ocurrió un error creando el rol", error.message);
    }

    return { data: data[0] };
}

//Edición de roles

export const updateRole = async (id_rol, nombre, nivel, permisosAgregados, permisosQuitados) => {
    const { data, error } = await supabase.rpc('actualizar_rol', {
        p_id_rol: id_rol,
        p_nombre: nombre,
        p_nivel: nivel,
        p_permisos_agregados: permisosAgregados,
        p_permisos_quitados: permisosQuitados
    })

    if (error) {
        console.log('error: ', error);
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

//Relacionar sectores a un usuario

export const updateUserSectors = async (id_usuario, sectoresAgregar = [], sectoresQuitar = [])=>{
    const {data, error} = await supabase.rpc('actualizar_sectores_usuario', {
        p_id_usuario: id_usuario,
        p_sectores_agregar: sectoresAgregar,
        p_sectores_quitar: sectoresQuitar
    });

    if (error) {
        // En caso de que se dispare el bloque EXCEPTION del RPC o falle la red
        throwServiceError(500, "Ocurrió un error al actualizar los sectores del usuario", error.message);
    }

    return { message: "Sectores actualizados con éxito." };
}

//Editar información de usuario

export const updateUser = async (id_usuario, userData) => {
    const { data, error } = await supabase
        .from('usuarios')
        .update(userData)
        .eq('id_usuario', id_usuario)
        .select();

    if (error) {
        console.log(error);
        throwServiceError(500, "Ocurrió un error editando el usuario", error.message);
    }

    return { data: data[0] };

}