// client/src/components/auth/Login.jsx
import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import { UserAuth } from '../context/AuthContext';
import Button from '../../../components/ui/Button';

export default function Login() {
  
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className='auth-container'>
      <div className='login-container'>
        <div className="login-header">
          <h1>Bienvenido</h1>
          <p>Ingrese sus credenciales para acceder a la cuenta.</p>
        </div>
        <form className='login-form' onSubmit={handleSubmit}>
          <label>
            DNI:
            <input placeholder='Número de DNI' type="text" onChange={(e)=>setDni(e.target.value)}/>
          </label>
          <label>
            Contraseña:
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <input 
                placeholder='Contraseña' 
                type={showPassword ? "text" : "password"}
                onChange={(e)=>setPassword(e.target.value)}
              />
              <button 
                type="button" // IMPORTANTE: type="button" evita que envíe el formulario
                onClick={() => setShowPassword(!showPassword)}
                style={{background:'transparent', color: '#9e9e9e', border: 'none', cursor:'pointer', padding:'0', display:'flex', alignItems:'center'}}
              >
                {showPassword ? 
                  (<i className="material-icons">visibility</i>): 
                  (<i className="material-icons">visibility_off</i>)
                }
              </button>
            </div>

          </label>

          {error && (
            <p className="error-message" style={{ color: "red" }}>
              {error}
            </p>
          )}

          <Button variant='default' type="submit" disabled={loading} style={{width:'100%', marginTop:'15px'}}>
            {loading ? "Cargando..." : "Ingresar"}
          </Button>
        </form>
        
        <div className="login-footer">
            Olvidó su contraseña? <a href="#">Recuperar contraseña</a>
        </div>

      </div>
    </div>
    </>
  );
}
