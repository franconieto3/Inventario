import { useState } from "react";
import Button from "../../../components/ui/Button";
import { apiCall } from "../../../services/api";


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function ResetPassword({usuario, onSuccess, onClose}){
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handlePasswordReset = async ()=>{

        setError("");

        //Validación de contraseña
        if (!password) { setError("La contraseña es obligatoria"); return false; }
        if (password.length < 6) { setError("Debe tener al menos 6 caracteres"); return false; }
        
        if (!confirmPassword) { setError("Debe confirmar la contraseña"); return false; }
        if (confirmPassword !== password) { setError("Las contraseñas no coinciden"); return false; }

        const payload = {
            id_usuario: usuario.id_usuario,
            password: password
        }

        try{
            setLoading(true);
            const res = await apiCall(`${API_URL}/auth/reset-password`,
                {
                    method: 'POST', 
                    body: JSON.stringify(payload)
                });
            
            alert("Contraseña cambiada con éxito");

            if (onSuccess) onSuccess();
            if (onClose) onClose();

        }catch(err){
            setError(err.message);
        }
        finally{
            setLoading(false);
        }   
    }

    return (
        <>
            <input 
                type="password" 
                className="input-text"
                placeholder="Contraseña" 
                onChange={(e)=>setPassword(e.target.value)}
            />
            <input 
                type="password" 
                className="input-text" 
                placeholder="Confirmar contraseña" 
                onChange={(e)=>setConfirmPassword(e.target.value)}
            />

            <p style={{color:'red'}}>{error}</p>

            <div className="modal-content">
                <Button variant="default" onClick={handlePasswordReset}>Guardar</Button>
            </div>
        </>
    );
}