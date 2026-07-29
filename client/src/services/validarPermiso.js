import { UserAuth } from "../features/auth/context/AuthContext";

export const validarPermiso = (permission) => {
    
    const { user } = UserAuth();

    if (permission!==null && !user?.permisos?.includes(permission)) {
        return false;
    }else{
        return true;
    }
    
}