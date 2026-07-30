import { useState } from "react";
import { apiCall } from "../../../services/api";
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useGraphProcessRoutes (){

    const navigate = useNavigate();
    
    // --- Creación
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (idRuta, nombre, tipoRuta, nodes, edges, estadoOriginal) => {

        // Validaciones
        if (!nombre || nombre === "") {
            alert("El nombre de la ruta es obligatorio");
            return;
        }
        if (!tipoRuta || tipoRuta === "") {
            alert("Debe especificar el tipo de ruta");
            return;
        }

        setLoading(true);

        try {
            if (!idRuta) {
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

                const res = await apiCall(`${API_URL}/api/procesos/ruta-procesos/new`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }else{
                const diff = calcularDiffGrafo(estadoOriginal, nodes, edges);

                const payloadDiff = {
                    ruta: { id_ruta: idRuta, nombre, id_tipo_ruta: parseInt(tipoRuta) },
                    nodos: diff.nodos,
                    aristas: diff.aristas
                };

                await apiCall(`${API_URL}/api/procesos/ruta-procesos/update/${idRuta}`, {
                    method: 'PUT',
                    body: JSON.stringify(payloadDiff)
                });
            }
            
            navigate("/procesos");

        } catch (err) {
            console.error("Error al enviar el grafo:", err);
            alert("Ocurrió un error al guardar la ruta");
        } finally {
            setLoading(false);
        }
    }

    const calcularDiffGrafo = (estadoOriginal, nodosActuales, aristasActuales) => {
        const originalNodos = estadoOriginal?.nodos || [];
        const originalAristas = estadoOriginal?.aristas || [];

        // --- NODOS ---
        const nodosAgregados = [];
        const nodosEditados = [];
        const nodosMapeo = new Map(nodosActuales.map(n => [n.id_nodo, n]));

        nodosActuales.forEach(nodo => {
            if (typeof nodo.id_nodo === 'string') {
                // Es un nodo nuevo creado en el frontend
                nodosAgregados.push({
                    id_local: nodo.id_nodo,
                    id_proceso: nodo.id_proceso ? parseInt(nodo.id_proceso) : null,
                    requiere_inspeccion: nodo.requiere_inspeccion || false,
                    x: Math.round(nodo.x),
                    y: Math.round(nodo.y),
                    inicio: nodo.inicio || false,
                    fin: nodo.fin || false
                });
            } else {
                // Es un nodo existente, comprobamos si cambió
                const original = originalNodos.find(o => o.id_nodo === nodo.id_nodo);
                if (original && (
                    original.x !== Math.round(nodo.x) ||
                    original.y !== Math.round(nodo.y) ||
                    original.requiere_inspeccion !== nodo.requiere_inspeccion
                )) {
                    nodosEditados.push({
                        id_nodo: nodo.id_nodo,
                        requiere_inspeccion: nodo.requiere_inspeccion,
                        x: Math.round(nodo.x),
                        y: Math.round(nodo.y)
                    });
                }
            }
        });

        const nodosEliminados = originalNodos
            .filter(o => !nodosMapeo.has(o.id_nodo) && !o.inicio && !o.fin)
            .map(o => o.id_nodo);

        // --- ARISTAS ---
        const aristasAgregadas = [];
        const aristasEditadas = [];
        
        // Función helper para identificar aristas de forma unívoca en el frontend
        const getIdArista = (origen, destino) => `${origen}-${destino}`;
        const aristasMapeo = new Set(aristasActuales.map(a => getIdArista(a.id_nodo_origen, a.id_nodo_destino)));

        aristasActuales.forEach(arista => {
            if (!arista.id_proceso_ruta) {
                // No tiene ID real, es una arista nueva
                aristasAgregadas.push({
                    origen_local: typeof arista.id_nodo_origen === 'string' ? arista.id_nodo_origen : null,
                    origen_real: typeof arista.id_nodo_origen === 'number' ? arista.id_nodo_origen : null,
                    destino_local: typeof arista.id_nodo_destino === 'string' ? arista.id_nodo_destino : null,
                    destino_real: typeof arista.id_nodo_destino === 'number' ? arista.id_nodo_destino : null,
                    prioridad: parseInt(arista.prioridad) || 1
                });
            } else {
                // Existe en BD, verificamos si cambió la prioridad
                const original = originalAristas.find(o => o.id_proceso_ruta === arista.id_proceso_ruta);
                if (original && original.prioridad !== parseInt(arista.prioridad)) {
                    aristasEditadas.push({
                        id_proceso_ruta: arista.id_proceso_ruta,
                        prioridad: parseInt(arista.prioridad)
                    });
                }
            }
        });

        const aristasEliminadas = originalAristas
            .filter(o => !aristasMapeo.has(getIdArista(o.id_nodo_origen, o.id_nodo_destino)))
            .map(o => o.id_proceso_ruta);

        return {
            nodos: { agregados: nodosAgregados, editados: nodosEditados, eliminados: nodosEliminados },
            aristas: { agregadas: aristasAgregadas, editadas: aristasEditadas, eliminadas: aristasEliminadas }
        };
    }
    
    return {handleSubmit, loading}
}