import { createContext, useEffect, useState, useContext } from "react";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'; 

export const AuthContextProvider = ({ children }) => {

  // Estado para el usuario (null si no hay nadie, objeto usuario si hay login)
  const [user, setUser] = useState(null);
  
  // Estado para saber si estamos verificando el localStorage (evita parpadeos)
  const [loading, setLoading] = useState(true);
  
  // Estado derivado para saber rápidamente si está autenticado
  const isAuthenticated = !!user;

  // 1. EFECTO: Verificar si ya hay sesión al cargar la página (Persistencia)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    const verifyToken = async ()=>{
      try{
        const response = await fetch(`${API_URL}/verificar`, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${storedToken}` // Header requerido por tu middleware 'verificarToken'
                  }
                });
        if (!response.ok) {
            throw new Error("Token inválido o expirado");
        }
        setUser(JSON.parse(storedUser));
      }catch(error){
        console.error("Sesión caducada:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }finally{
        setLoading(false);
      }
    }

    if (storedToken && storedUser) {
      verifyToken();
    }else{
      setLoading(false);
    }
    
  }, []);

  // 2. FUNCIÓN LOGIN: Conecta con tu backend
  const login = async (dni, password) => {
      try {
          const response = await fetch("http://localhost:4000/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dni, password })
          });

          const data = await response.json();

          if (!response.ok) {
              throw new Error(data.error || "Error al iniciar sesión");
          }

          // Guardamos en LocalStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Actualizamos el estado global
          setUser(data.user);
          
          return data; // Retornamos data por si el componente quiere hacer algo extra

      } catch (error) {
      throw error; // Lanzamos el error para que el componente Login lo muestre
      }
  };

  // 3. FUNCIÓN LOGOUT: Limpia todo
  const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
  };

  return (
      <AuthContext.Provider value={{ 
          user, 
          isAuthenticated, 
          loading, 
          login, 
          logout 
      }}>
          {children}
      </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};