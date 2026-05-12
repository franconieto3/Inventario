import { supabase } from "../config/supabase.js";

export const getUserList = async ()=>{
    const {data, error} = await supabase.rpc('obtener_listado_usuarios',{});

    if (error){
        throw new Error({statusCode: 500, message: "Ocurrió un error obteniendo el listado de usuarios"});
    }

    return {data};
}

export const getRolList = async ()=>{
    const {data, error} = await supabase.from('rol').select('*').order('descripcion', { ascending: true });;

    if (error){
        throw new Error({statusCode: 500, message: "Ocurrió un error obteniendo el listado de roles"});
    }

    return {data};
}

export const getPermissionList = async ()=>{
    const {data, error} = await supabase.from('permiso').select('*').order('descripcion', { ascending: true });;

    if (error){
        throw new Error({statusCode: 500, message: "Ocurrió un error obteniendo el listado de permisos"});
    }

    return {data};
}

