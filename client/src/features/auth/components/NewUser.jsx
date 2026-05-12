import { useState } from "react";
import Button from "../../../components/ui/Button";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function NewUser({onSuccess, onClose}){

    const [formData, setFormData] = useState({
        dni: "",
        password: "",
        confirmation: "",
        name: "",
        email: "",
        telefono: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { dni, password, confirmation, name, email, telefono } = formData;

    const validate = () => {
        if (!dni.trim()) { setError("El DNI es obligatorio"); return false; }
        if (!/^[0-9]+$/.test(dni)) { setError("El DNI solo debe contener números"); return false; }
        
        if (!password) { setError("La contraseña es obligatoria"); return false; }
        if (password.length < 6) { setError("Debe tener al menos 6 caracteres"); return false; }
        
        if (!confirmation) { setError("Debe confirmar la contraseña"); return false; }
        if (confirmation !== password) { setError("Las contraseñas no coinciden"); return false; }
        
        if (!name.trim()) { setError("El nombre es obligatorio"); return false; }
        
        if (!email.trim()) { setError("El email es obligatorio"); return false; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError("El email no es válido"); return false; }
        
        if (!telefono.trim()) { setError("El teléfono es obligatorio"); return false; }
        if (telefono.length < 6) { setError("El teléfono debe tener al menos 6 dígitos"); return false; }

        return true;
    };

    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError("");

        if (!validate()) return;

        setLoading(true);
        try {
            //const data = await apiCall(`${API_URL}/auth/register`, {method:'POST', body: JSON.stringify({ dni, password, name, email, telefono })});

            console.log("Registro exitoso:",{ dni, password, name, email, telefono })

            if (onSuccess) onSuccess();
            if (onClose) onClose();

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
            setFormData((prev)=>({
                    dni: "",
                    password: "",
                    confirmation: "",
                    name: "",
                    email: "",
                    telefono: ""
                })
            );
        }
    }

    return (
        <>
            <div>
                <div style={{"display":"flex", "justifyContent":"center", "alignItems":"center", "height":"100%"}}>
                    <div className='login-container' style={{"backgroundColor":"white"}}>
                        <form className='login-form' onSubmit={handleSubmit}>

                            {/* DNI */}
                            <label>
                                <input
                                type="text"
                                placeholder="DNI"
                                value={dni}
                                onChange={(e) => setFormData((prev) => ({...prev, dni: e.target.value,}))}
                                />
                            </label>

                            {/* Password */}
                            <label>
                                <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setFormData((prev) => ({...prev, password: e.target.value,}))}
                                />
                            </label>

                            {/* Confirmación */}
                            <label>
                                <input
                                type="password"
                                placeholder="Confirmar contraseña"
                                value={confirmation}
                                onChange={(e) => setFormData((prev) => ({...prev, confirmation: e.target.value,}))}
                                />
                            </label>

                            {/* Nombre */}
                            <label>
                                <input
                                type="text"
                                placeholder="Nombre y apellido"
                                value={name}
                                onChange={(e) => setFormData((prev) => ({...prev, name: e.target.value,}))}
                                />
                            </label>

                            {/* Email */}
                            <label>
                                <input
                                type="text"
                                placeholder="e-mail"
                                value={email}
                                onChange={(e) => setFormData((prev) => ({...prev, email: e.target.value,}))}
                                />
                            </label>

                            {/* Teléfono */}
                            <label>
                                <input
                                type="text"
                                placeholder="Teléfono"
                                value={telefono}
                                onChange={(e) => setFormData((prev) => ({...prev, telefono: e.target.value,}))}
                                />
                            </label>

                            {error && <p style={{ color: "red", marginBottom: '15px' }}>{error}</p>}

                            <Button variant="default" type="submit" disabled={loading}>
                                {loading ? "Registrando..." : "Registrar usuario"}
                            </Button>
                        </form>
                    </div>
                </div>
          </div> 
        </>
    );
}