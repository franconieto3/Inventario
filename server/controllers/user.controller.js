import { createRole, deactivateUser, deleteRole, getPermissionList, getRolList, getUserList, miMaximoNivel, updateRole, updateUser, updateUserRoles, updateUserSectors } from "../services/user.service.js"

export const usuarios = async (req, res)=>{
    try{
        const data = await getUserList();
        return res.status(200).json({
            message: "Datos obtenidos exitosamente",
            data: data
        })
    }catch(err){
        console.error();
        return res.status(err.statusCode || 500).json({message: err.message || "No se encontraron resultados"});
    }
}

export const editarUsuario = async (req, res)=>{
    try{
        const {id} = req.params;
        const {nombre, email, telefono} = req.body;

        const data = await updateUser(id, {nombre, email, telefono});

        res.status(200).json({
            message: "Usuario editado exitosamente",
            data: data
        })

    }catch(err){
        console.error();
        return res.status(err.statusCode || 500).json({message: err.message || "Ocurrió un error editando el usuario"});
    }
}

export const baja = async (req, res)=>{
    try{
        const {id} = req.params;
        const solicitante = req.usuario;
        const {usuario} = req.body;

        //Evitar darse de baja a uno mismo
        if(solicitante.id_usuario === id) return res.status(400).json({message: 'No es posible darse de baja a uno mismo'})

        //Evitar dar de baja a usuarios con roles de mayor jerarquia
        if (miMaximoNivel(solicitante) > miMaximoNivel(usuario)){
            return res.status(400).json({message: 'No es posible dar de baja a este usuario'})    
        }

        const data = await deactivateUser(id);

        return res.status(200).json({
            message: "Usuario dado de baja exitosamente"
        })
    }catch(err){
        return res.status(err.statusCode || 500).json({message: err.message || "Ocurrió un error dando de baja al usuario"});
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
        console.error();
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
        console.error();
        return res.status(err.statusCode || 500).json({message: err.message || "No se encontraron resultados"});
    }
}

export const administrarRoles = async (req, res)=>{
    try{
        const solicitante = req.usuario;

        const {id_usuario, rolesAgregados, rolesQuitados} = req.body;
        
        //Verifificar que el usuario afectado no sea el estado solicitante
        if(id_usuario === solicitante.id_usuario) return res.status(400).json({message: 'No puedes modificar tus propios roles'})

        //Calcular la jerarquía máxima del usuario solicitante
        const maximoSolicitante = miMaximoNivel(solicitante);

        //Verificar que tanto los roles agregados como quitados sean de menor jerarquía que el mejor rol del usuario solicitante
        if (rolesAgregados.some((rol)=>rol.nivel > maximoSolicitante)) return res.status(400).json({message: 'Al menos uno de los roles agregados excede tu nivel de jerarquía'});
        if(rolesQuitados.some((rol)=>rol.nivel > maximoSolicitante)) return res.status(400).json({message: 'Al menos uno de los roles quitados excede tu nivel de jerarquía'});

        const idsAgregados = rolesAgregados.map(rol => rol.id_rol);
        const idsQuitados = rolesQuitados.map(rol => rol.id_rol);

        //Ejecutar la función de servicio
        const data = await updateUserRoles(id_usuario, idsAgregados, idsQuitados);
    
        return res.status(200).json({
            message: "Roles actualizados exitosamente",
            data: data
        });

    }catch(err){
        console.error();
        return res.status(err.statusCode || 500).json({message: err.message || "Ocurrió un error al actualizar los roles del usuario"});
    }
}

export const administrarSectores = async (req, res)=>{
    try{
        const solicitante = req.usuario;
        const {id_usuario, sectoresAgregados, sectoresQuitados} = req.body;

        //Verifificar que el usuario afectado no sea el estado solicitante
        if(id_usuario === solicitante.id_usuario) return res.status(400).json({message: 'No puedes modificar tus propios sectores'});

        const data = await updateUserSectors(id_usuario, sectoresAgregados, sectoresQuitados); 

        return res.status(200).json({
            message: "Sectores actualizados exitosamente",
            data: data
        });
    
    }catch(err){
        console.error();
        return res.status(err.statusCode || 500).json({message: err.message || "Ocurrió un error al actualizar los sectores del usuario"});
    }
}

export const crearRol = async (req, res) =>{
    try{
        const {nombre, nivel, permisos} = req.body;

        const data = await createRole(nombre, nivel, permisos);

        return res.status(200).json({
            message: 'Rol creado exitosamente'
        })
    }catch(err){
        return res.status(err.statusCode || 500).json({message: err.message || "Ocurrió un error al crear el rol"});
    }
}

export const editarRol = async (req, res) =>{
    try{
        const {id} = req.params;
        const {nombre, nivel, permisosAgregados, permisosQuitados} = req.body;

        const data = await updateRole(id, nombre, nivel, permisosAgregados, permisosQuitados);

        return res.status(200).json({
            message: 'Rol editado exitosamente'
        })
    }catch(err){
        return res.status(err.statusCode || 500).json({message: err.message || "Ocurrió un error al actualizar el rol"});
    }
}

export const eliminarRol = async (req, res) =>{
    try{
        const {id} = req.params;
        const data = await deleteRole(id);

        return res.status(200).json({
            message: 'Rol eliminado exitosamente'
        })

    }catch(err){
        return res.status(err.statusCode || 500).json({message: err.message || "Ocurrió un error al eliminar el rol seleccionado"});
    }
}

