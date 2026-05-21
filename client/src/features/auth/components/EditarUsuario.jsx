import { useState } from "react";
import { apiCall } from "../../../services/api";
import Button from "../../../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function EditarUsuario({usuario, onSuccess, onClose}){
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: usuario.name,
        email: usuario.email,
        telefono: usuario.telefono
    });
    
    const { name, email, telefono } = formData;

    const validate = () => {
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
            const data = await apiCall(`${API_URL}/api/usuarios/${usuario.id_usuario}/edit`, {method:'PUT', body: JSON.stringify({ name, email, telefono })});

            if (onSuccess) onSuccess();
            if (onClose) onClose();

        } catch (error) {
            console.log(error);
            setError(error.message);
        } finally {
            setLoading(false);
            setFormData((prev)=>({
                    name: "",
                    email: "",
                    telefono: ""
                })
            );
        }
    }
    
    return(
        <>
        
            <div>
                <div style={{"display":"flex", "justifyContent":"center", "alignItems":"center", "height":"100%"}}>
                    <div className='login-container' style={{"backgroundColor":"white"}}>
                        <form className='login-form' onSubmit={handleSubmit}>

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

                            <Button variant="default" type="submit" disabled={loading} style={{marginTop:'20px'}}>
                                {loading ? "Guardando..." : "Guardar cambios"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div> 
        </>
    )
}