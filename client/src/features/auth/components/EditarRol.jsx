import { useState } from "react";
import { SearchSelector } from "../../../components/ui/SearchSelector";
import { apiCall } from "../../../services/api";
import Button from "../../../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function EditarRol({rol, permisos, onClose, onSuccess}){

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [nombre, setNombre] = useState(rol.descripcion);
    const [nivel, setNivel] = useState(rol.nivel);

    const [permisosSeleccionados, setPermisosSeleccionados] = useState(rol.permisos);

    

    const handleGuardarCambios = async ()=>{
        setError("");
        
        const idsIniciales = rol.permisos.map(p => p.id_permiso);
        const idsSeleccionados = permisosSeleccionados.map(p => p.id_permiso);

        // Agregados: Están en la selección nueva, pero no estaban inicialmente
        const permisosAgregados = permisosSeleccionados.filter(p => !idsIniciales.includes(p.id_permiso));
        
        // Quitados: Estaban inicialmente, pero ya no están en la selección nueva
        const permisosQuitados = rol.permisos.filter(p => !idsSeleccionados.includes(p.id_permiso));
        
        const payload={
            nombre: nombre,
            nivel: Number(nivel),
            permisosAgregados: permisosAgregados.map(p => p.id_permiso),
            permisosQuitados: permisosQuitados.map(p => p.id_permiso)
        }
        
        try{
            setLoading(true);
            
            const res = await apiCall(`${API_URL}/api/usuarios/rol/${rol.id_rol}`,{method: 'PUT', body: JSON.stringify(payload)});
            
            if(onClose) onClose();
            if(onSuccess) onSuccess();
        
        }catch(err){
            console.err(err.message);
            setError(err.message);

        }finally{
            setLoading(false);
        }
    }

    return(
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
                            //Todos los permisos que no estén entre los ids iniciales
                            opciones={permisos}
                            placeholder="Buscar permisos..."
                            keys={['id_permiso', 'descripcion']}
                            idField ='id_permiso'
                            displayField ='descripcion'
                            onSelectionChange={(lista) => setPermisosSeleccionados(lista)}
                            initialSelections={permisosSeleccionados}
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