import { useState, useMemo } from "react";
import { SearchSelector } from "../../../components/ui/SearchSelector";
import { UserAuth } from "../context/AuthContext";
import { useEffect } from "react";
import Button from "../../../components/ui/Button";

import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AdministrarRoles({ roles, usuario, user, onSuccess, onClose }) {
    //const { user} = UserAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const esMismoUsuario = user?.id_usuario === usuario?.id_usuario || user?.email === usuario?.email;

    //Calcular la jerarquía máxima del usuario solicitante
    const miMaximoNivel = useMemo(() => {
        if (!user?.roles || user.roles.length === 0) return 999;
        return Math.min(...user.roles.map(r => r.nivel));
    }, [user]);

    // Filtramos los roles globales para dejar SOLO los de menor jerarquía (nivel mayor al mío)
    const rolesGestionables = useMemo(() => {
        return roles.filter(rol => rol.nivel > miMaximoNivel);
    }, [roles, miMaximoNivel]);

    // Separamos los roles actuales del usuario en "Gestionables" y "No Gestionables"
    const rolesActualesGestionables = useMemo(() => {
        return usuario.roles.filter(rol => rol.nivel > miMaximoNivel);
    }, [usuario, miMaximoNivel]);

    const rolesActualesIntocables = useMemo(() => {
        return usuario.roles.filter(rol => rol.nivel <= miMaximoNivel);
    }, [usuario, miMaximoNivel]);

    // Estado para capturar lo que el componente SearchSelector devuelve
    const [rolesSeleccionados, setRolesSeleccionados] = useState(rolesActualesGestionables);

    const handleGuardarCambios = async () => {
        setError("");

        // Extraemos IDs para facilitar la comparación
        const idsIniciales = rolesActualesGestionables.map(r => r.id_rol);
        const idsSeleccionados = rolesSeleccionados.map(r => r.id_rol);

        // Agregados: Están en la selección nueva, pero no estaban inicialmente
        const rolesAgregados = rolesSeleccionados.filter(r => !idsIniciales.includes(r.id_rol));
        
        // Quitados: Estaban inicialmente, pero ya no están en la selección nueva
        const rolesQuitados = rolesActualesGestionables.filter(r => !idsSeleccionados.includes(r.id_rol));

        const payload = {
            id_usuario: usuario.id_usuario,
            rolesAgregados: rolesAgregados,
            rolesQuitados: rolesQuitados
        };

        try {
            setLoading(true);

            const res = await apiCall(`${API_URL}/api/usuarios/${usuario.id_usuario}/roles`, {
                method: 'POST',
                body: JSON.stringify(payload)
            })

            if (onSuccess) onSuccess(payload); // Opcional: pasar el resultado al padre
            if (onClose) onClose();
            
        } catch (error) {
            console.error("Error al actualizar los roles:", error);
            setError(error.message);
        }finally{
            setLoading(false);
        }
    };

    // Renderizado temprano si es el mismo usuario
    if (esMismoUsuario) {
        return (
            <div className="modal-content">
                <p style={{color:'red', padding:'20px'}}>Error: No puedes modificar tus propios roles.</p>
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            </div>
        );
    }

    return (
        <div className="modal-content">

            {rolesActualesIntocables.length > 0 && (
                <div style={{border: '1px solid #e2e8f0', padding: '0.8rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '5px'}}>
                    <ul style={{display:'flex',listStyle:'none', fontSize:'0.875rem', paddingLeft:'0', margin:'0', marginBottom:'0',fontWeight:'500',color: '#334155'}}>
                        {rolesActualesIntocables.map(rol => (
                            <li key={rol.id_rol}>
                                {rol.descripcion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div>
                {rolesGestionables.length > 0 ? (
                    <SearchSelector
                        opciones={rolesGestionables}
                        placeholder="Buscar y asignar roles..."
                        keys={["id_rol", "descripcion"]}
                        idField="id_rol"
                        displayField="descripcion"
                        onSelectionChange={(lista) => setRolesSeleccionados(lista)}
                        initialSelections={rolesActualesGestionables}
                    />
                ) : (
                    <p>No existen roles de menor jerarquía disponibles para asignar.</p>
                )}
            </div>
            <p style={{color:'red'}}>{error}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button
                    variant="default"
                    onClick={handleGuardarCambios}
                    disabled={rolesGestionables.length === 0}>
                        Guardar Cambios
                </Button>
            </div>
        </div>
    );
}