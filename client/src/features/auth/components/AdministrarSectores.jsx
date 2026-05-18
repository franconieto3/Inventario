import { useState } from "react";
import { SearchSelector } from "../../../components/ui/SearchSelector";
import { apiCall } from "../../../services/api";
import Button from "../../../components/ui/Button";
import { UserAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AdministrarSectores({sectores = [], usuario, user, onSuccess, onClose}){
    //const {user} = UserAuth();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [sectoresSeleccionados, setSectoresSeleccionados] = useState([]);

    const esMismoUsuario = user?.id_usuario === usuario?.id_usuario || user?.email === usuario?.email;

    const handleGuardarCambios = async()=>{
        setError("");

        // Extraemos IDs para facilitar la comparación
        const idsIniciales = usuario.sectores.map(r => r.id_sector);
        const idsSeleccionados = rolesSeleccionados.map(r => r.id_sector);

        // Agregados: Están en la selección nueva, pero no estaban inicialmente
        const sectoresAgregados = sectoresSeleccionados.filter(r => !idsIniciales.includes(r.id_rol));
        
        // Quitados: Estaban inicialmente, pero ya no están en la selección nueva
        const sectoresQuitados = sectoresActualesGestionables.filter(r => !idsSeleccionados.includes(r.id_rol));

        const payload = {
            id_usuario: usuario.id_usuario,
            sectoresAgregados: sectoresAgregados,
            sectoresQuitados: sectoresQuitados
        };

        try{
            setLoading(true);

            const res = await apiCall(`${API_URL}/api/usuarios/${usuario.id_usuario}/sectores`, {
                method: 'POST',
                body: JSON.stringify(payload)
            })

            if (onSuccess) onSuccess(payload); 
            if (onClose) onClose();

        }catch(err){
            console.log(err.message)
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }

    // Renderizado temprano si es el mismo usuario
    if (esMismoUsuario) {
        return (
            <div className="modal-content">
                <p style={{color:'red', padding:'20px'}}>No puedes modificar tus propios sectores.</p>
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            </div>
        );
    }

    return(
        <>
            <div className="modal-content">
                {sectores.length > 0 ? (
                    <SearchSelector
                        opciones={sectores}
                        placeholder="Buscar sectores.."
                        keys={["id_sector", "descripcion"]}
                        idField="id_sector"
                        displayField="descripcion"
                        onSelectionChange={(lista) => setSectoresSeleccionados(lista)}
                        initialSelections={usuario.sectores}
                    />) : (
                        <p>No existen sectores disponibles para asignar.</p>
                    )
                }
                <p style={{color:'red'}}>{error}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button
                        variant="default"
                        onClick={handleGuardarCambios}
                        disabled={sectores.length === 0}>
                            Guardar Cambios
                    </Button>
                </div>
            </div>
        </>
    )
}