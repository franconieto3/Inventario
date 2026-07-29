import { useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useGetGraph(id){

    const [loadingData, setLoadingData] = useState(false);
    const [graphData, setGraphData] = useState(null);
    const [error, setError] = useState(null);

    const limpiarGrafoRapido = (grafo)=>{
        
        if (!grafo || !grafo.aristas || !grafo.nodos) return null;

        const ahora = new Date();

        // Filtramos aristas
        const aristasValidas = grafo.aristas.filter(a => 
            a.valido_hasta === null || new Date(a.valido_hasta) > ahora
        );

        // Recolectamos todos los IDs de nodos que participan en una arista válida
        const nodosActivos = new Set();
        aristasValidas.forEach(a => {
            nodosActivos.add(a.id_nodo_origen);
            nodosActivos.add(a.id_nodo_destino);
        });

        // Mantenemos los nodos activos + los nodos de inicio/fin por si acaso
        const nodosConectados = grafo.nodos.filter(n => 
            n.inicio || n.fin || nodosActivos.has(n.id_nodo)
        );

        return {
            ...grafo,
            nodos: nodosConectados,
            aristas: aristasValidas
        };
    }

    useEffect(()=>{

        if (!id) {
            setGraphData(null);
            return;
        }

        const fetchGraph = async ()=>{
            setLoadingData(true);
            setError(null);

            try{
                const data = await apiCall(`${API_URL}/api/procesos/ruta-procesos/${id}`, {method: 'GET'});
                
                const cleanedData = limpiarGrafoRapido(data);

                setGraphData(cleanedData);

            }catch(err){
                setError(err.message);
            }finally{
                setLoadingData(false);
            }
        }

        fetchGraph();
    },[]);

    return {graphData, loadingData, error};
}