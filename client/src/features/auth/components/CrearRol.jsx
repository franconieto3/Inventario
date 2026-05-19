import { useState } from "react";
import { SearchSelector } from "../../../components/ui/SearchSelector";
import { apiCall } from "../../../services/api";
import Button from "../../../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function CrearRol({permisos = [], onClose, onSuccess}){
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [nombre, setNombre] = useState("");
    const [nivel, setNivel] = useState("");

    const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);

    const handleGuardarCambios = async ()=>{
        setError("");
        
        const payload={
            nombre: nombre,
            nivel: Number(nivel),
            permisos: permisosSeleccionados.map((p) => p.id_permiso)
        }
        
        try{
            setLoading(true);
            
            const res = await apiCall(`${API_URL}/api/usuarios/rol`,{method: 'POST', body: JSON.stringify(payload)});
            
            if(onClose) onClose();
            if(onSuccess) onSuccess();
        
        }catch(err){
            console.err(err.message);
            setError(err.message);

        }finally{
            setLoading(false);
        }
    }
    
    return (
        <>
            <div className="modal-content">
                <label>
                    <input
                    type="text"
                    placeholder="Nombre..."
                    className="ai-form-input" 
                    style={{width:'100%'}}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    />
                </label>
                <label>
                    <input
                    type="number"
                    placeholder="Nivel..."
                    className="ai-form-input" 
                    style={{width:'100%'}}
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value)}
                    />
                </label>
                {permisos.length > 0 ?
                    (<SearchSelector
                            opciones={permisos}
                            placeholder="Buscar permisos..."
                            keys={['id_permiso', 'descripcion']}
                            idField ='id_permiso'
                            displayField ='descripcion'
                            onSelectionChange={(lista) => setPermisosSeleccionados(lista)}
                    />) : 
                    (<p>No se encontraron permisos disponibles para asignar.</p>)
                }
                <p style={{color:'red'}}>{error}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Button
                        variant="default"
                        onClick={handleGuardarCambios}
                        disabled={permisos.length === 0}>
                            Guardar Cambios
                    </Button>
                </div>
            </div>
        </>
    );
}