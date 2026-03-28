import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useProcessRoutes(){
    
    const [rutas, setRutas] = useState([]);
    
    //Carga
    const [loadingRoutes, setLoadingRoutes] = useState(false);

    //Paginación
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    //Categorización

    const refreshRutas = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(()=>{
        const fetchRoutes = async()=>{
            setLoadingRoutes(true);
            try{
                let query = `?page=${page}&limit=20`;
                //if (tipoSeleccionado && tipoSeleccionado!=="0") query += `&id_tipo_proceso=${tipoSeleccionado}`;
                const data = await apiCall(`${API_URL}/api/procesos/ruta/listado${query}`, {});

                if (data && data.rutas && Array.isArray(data.rutas)) {
                    // CASO A: Paginación correcta { data: [], total: 100 }
                    setRutas(data.rutas);
                    setTotalPages(data.totalPages || Math.ceil(data.total / 20));
                } else if (Array.isArray(data)) {
                    // CASO B: Devuelve array directo [{}, {}]
                    setRutas(data);
                    setTotalPages(1);
                } else {
                    // CASO C: Formato desconocido o error -> Forzamos array vacío para evitar crash
                    console.warn("Formato de productos desconocido, se usará array vacío.");
                    setRutas([]); 
                }


            }catch(err){
                console.error("Error cargando rutas", err);
            }finally{
                setLoadingRoutes(false);
            }
        }
        fetchRoutes();
    },[page, refreshTrigger]);

    const crearRuta = useCallback( async (payload)=>{
        console.log("Enviando: ", payload);

        const res = await apiCall(`${API_URL}/api/procesos/ruta/pieza`,{
            method: 'POST',
            body: JSON.stringify({ruta: payload})
        })

        setRefreshTrigger(prev => prev + 1);
    },[])

    return {rutas, totalPages, page, loadingRoutes, setLoadingRoutes, setPage, setTotalPages, refreshRutas, crearRuta};
}