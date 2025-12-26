// client/src/components/auth/Register.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Register() {

  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!dni.trim()) newErrors.dni = "El DNI es obligatorio";
    else if (!/^[0-9]+$/.test(dni)) newErrors.dni = "El DNI solo debe contener números";

    if (!password) newErrors.password = "La contraseña es obligatoria";
    else if (password.length < 6)
      newErrors.password = "Debe tener al menos 6 caracteres";

    if (!confirmation) newErrors.confirmation = "Debe confirmar la contraseña";
    else if (confirmation !== password)
      newErrors.confirmation = "Las contraseñas no coinciden";

    if (!name.trim()) newErrors.name = "El nombre es obligatorio";

    if (!email.trim()) newErrors.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "El email no es válido";

    if (!telefono.trim()) newErrors.telefono = "El teléfono es obligatorio";
    else if (telefono.length < 6)
      newErrors.telefono = "El teléfono debe tener al menos 6 dígitos";

    setErrors(newErrors);

    // Si no hay errores, retorna true
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ dni, password, name, email, telefono })
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || "Error al registrar usuario");
      } else {
        console.log("Registro exitoso:", data);
      }
    } catch (error) {
      setServerError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
      setDni("");
      setPassword("");
      setConfirmation("");
      setName("");
      setEmail("");
      setTelefono("");
    }
  };

  return (
    <>
      <NavBar/>
      <div style={{"height": "calc(100dvh - 90px)"}}>
        <div style={{"display":"flex", "justifyContent":"center", "alignItems":"center", "height":"100%"}}>
          <div className='login-container' style={{"backgroundColor":"white"}}>
            <form className='login-form' onSubmit={handleSubmit}>

              {/* Error del servidor */}
              {serverError && (
                <p style={{ color: "red", fontWeight: "bold" }}>{serverError}</p>
              )}

              {/* DNI */}
              <label>
                <input
                  type="text"
                  placeholder="DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                />
              </label>
              {errors.dni && <p style={{ color: "red" }}>{errors.dni}</p>}

              {/* Password */}
              <label>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}

              {/* Confirmación */}
              <label>
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </label>
              {errors.confirmation && (
                <p style={{ color: "red" }}>{errors.confirmation}</p>
              )}

              {/* Nombre */}
              <label>
                <input
                  type="text"
                  placeholder="Nombre y apellido"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}

              {/* Email */}
              <label>
                <input
                  type="text"
                  placeholder="e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

              {/* Teléfono */}
              <label>
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </label>
              {errors.telefono && <p style={{ color: "red" }}>{errors.telefono}</p>}

              <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? "Registrando..." : "Registrar usuario"}
              </button>
            </form>
          </div>
        </div>
      </div>  
    </>
  );
}