import { getPermissionList, getRolList, getUserList, miMaximoNivel, updateUserRoles } from "../services/user.service.js"

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

export const administrarRoles = async (req, res)=>{
    try{
        const solicitante = req.usuario;

        const {id_usuario, rolesAgregados, rolesQuitados} = req.body;

        console.log(rolesAgregados);
        
        //Verifificar que el usuario afectado no sea el estado solicitante
        if(id_usuario === solicitante.id_usuario) return res.status(400).json({message: 'No puedes modificar tus propios roles'})

        //Calcular la jerarquía máxima del usuario solicitante
        const maximoSolicitante = miMaximoNivel(solicitante);

        //Verificar que tanto los roles agregados como quitados sean de menor jerarquía que el mejor rol del usuario solicitante
        if (rolesAgregados.some((rol)=>rol.nivel > maximoSolicitante)) return res.status(400).json({message: 'Al menos uno de los roles agregados excede tu nivel de jerarquía'});
        if(rolesQuitados.some((rol)=>rol.nivel > maximoSolicitante)) return res.status(400).json({message: 'Al menos uno de los roles quitados excede tu nivel de jerarquía'});

        //Ejecutar la función de servicio
        const data = await updateUserRoles(id_usuario, rolesAgregados, rolesQuitados);
    
        return res.status(200).json({
            message: "Roles actualizados exitosamente",
            data: data
        });

    }catch(err){
        console.err();
        return res.status(err.statusCode || 500).json({message: err.message || "Ocurrió un error al actualizar los roles del usuario"});
    }
}


