// client/src/components/auth/Login.jsx
import React, { useState, useContext, useEffect } from 'react';
//import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/authContext';
import "../../styles/Login.css";

export default function Login() {
  
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { login, loading, isAuthenticated} = UserAuth();
  
  //Si ya está autenticado, redirigir automáticamente
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/HomePage');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (!dni || !password) {
        setError("Debe completar todos los campos.");
        return;
      }

      try {
        // Usamos la función del contexto
        await login(dni, password);
        
        // Si no hubo error, redirigimos
        navigate('/HomePage'); 
        
      } catch (err) {
        // Si hubo error en el contexto, lo capturamos aquí
        if (err.message === "Failed to fetch") {
          setError("No se pudo conectar con el servidor. Verifique su conexión o intente más tarde.");
        } else {
          setError("Usuario o contraseña incorrectos");
        }
      }
    };
  

  return(
    <>
    <div>
      <h1>Iniciar sesión</h1>
      <form className='login-form' onSubmit={handleSubmit}>
        <label>
          Ingrese su DNI:
          <input placeholder='Número de DNI' type="text" onChange={(e)=>setDni(e.target.value)}/>
        </label>
        <label>
          Contraseña:
          <input placeholder='Contraseña' type="password" onChange={(e)=>setPassword(e.target.value)}/>
        </label>
        <p><a href=''>¿Olvidaste tu contraseña?</a></p>

        {error && (
          <p className="error-message" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
    </>
  );
}
