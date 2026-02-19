import { UserAuth } from "../features/auth/context/AuthContext";

export const Can = ({ permission, children }) => {
  const { user } = UserAuth();

  // Si no hay usuario o no tiene el permiso, no renderiza nada
  if (permission!==null && !user?.permisos?.includes(permission)) {
    return null;
  }

  // Si tiene permiso, renderiza el contenido
  return <>{children}</>;
};

export default Can;