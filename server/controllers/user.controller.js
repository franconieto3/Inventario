import { getPermissionList, getRolList, getUserList } from "../services/user.service.js"

export const usuarios = async (req, res)=>{
    try{
        const data = await getUserList();
        return res.status(200).json({
            message: "Datos obtenidos exitosamente",
            data: data
        })
    }catch(err){
        console.err();
        return res.status(err.statusCode || 500).json({message: err.message || "No se encontraron resultados"});
    }
}

export const permisos = async (req, res) =>{
    try{
        const data = await getPermissionList();

        return res.status(200).json({
            message: "Datos obtenidos exitosamente",
            data: data
        })

    }catch(err){
        console.err();
        return res.status(err.statusCode || 500).json({message: err.message || "No se encontraron resultados"});
    }
}

export const roles = async (req, res) =>{
    try{
        const data = await getRolList();

        return res.status(200).json({
            message: "Datos obtenidos exitosamente",
            data: data
        })

    }catch(err){
        console.err();
        return res.status(err.statusCode || 500).json({message: err.message || "No se encontraron resultados"});
    }
}

