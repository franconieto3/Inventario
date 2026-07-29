import { useState } from "react";
import { apiCall } from "../../../services/api";
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useGraphProcessRoutes (){

    const navigate = useNavigate();
    
    // --- Creación
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (nombre, tipoRuta, nodes, edges) => {

        // Validaciones
        if (!nombre || nombre === "") {
            alert("El nombre de la ruta es obligatorio");
            return;
        }
        if (!tipoRuta || tipoRuta === "") {
            alert("Debe especificar el tipo de ruta");
            return;
        }

        // 1. Mapeo de Nodos
        const nodosFormateados = nodes.map(node => ({
            id_local: node.id_nodo,
            id_proceso: node.id_proceso ? parseInt(node.id_proceso) : null,
            requiere_inspeccion: node.requiere_inspeccion || false,
            x: Math.round(node.x),
            y: Math.round(node.y),
            inicio: node.inicio || false,
            fin: node.fin || false
        }));

        // 2. Mapeo de Aristas
        const aristasFormateadas = edges.map(edge => ({
            origen_local: edge.id_nodo_origen,
            destino_local: edge.id_nodo_destino,
            prioridad: edge.prioridad ? parseInt(edge.prioridad) : 1
        }));

        // 3. Estructura del Payload final
        const payload = {
        ruta: {
            nombre: nombre,
            id_tipo_ruta: parseInt(tipoRuta)
        },
        nodos: nodosFormateados,
        aristas: aristasFormateadas
        };

        try {
            setLoading(true);

            const res = await apiCall(`${API_URL}/api/procesos/ruta-procesos/new`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            console.log("Grafo creado exitosamente:", res.message);
            navigate("/procesos");

        } catch (err) {
            console.error("Error al enviar el grafo:", err);
        } finally {
            setLoading(false);
        }
    }
    
    return {handleSubmit, loading}
}