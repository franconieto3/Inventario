// client/src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../features/auth/context/AuthContext';

const PrivateRoute = ({ permission = null, children }) => {
  const { user, loading } = UserAuth();

  // 1. Si todavía está verificando el localStorage, mostramos un "Cargando..."
  // Esto evita que te redirija al login por error mientra carga.
  if (loading) {
    return <div>Cargando...</div>; 
  }

  // 2. Si ya terminó de cargar y NO hay usuario, redirigir al Login
  if (!user) {
    // 'replace' evita que el usuario pueda volver atrás con el botón del navegador
    return <Navigate to="/login" replace />;
  }

  if (permission!==null && !user?.permisos?.includes(permission)) {
    return <Navigate to="/homepage" replace />;
  }

  // 3. Si hay usuario, renderizar el componente hijo (ej: Dashboard)
  return children;
};

export default PrivateRoute;