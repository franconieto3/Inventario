import { useCallback, useEffect, useState, useMemo } from "react"
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useProcesos(){

    const [allProcesos, setAllProcesos] = useState([]);
    const [unidades, setUnidades] = useState([]);
    
    //Carga
    const [loading, setLoading] = useState(false);
    const [loadingProcesos, setLoadingProcesos] = useState(false);

    //Paginación

    const [page, setPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    //Categorización
    const limit = 20;

    const refreshProcesos = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(()=>{
        const fetchDatosAux = async ()=>{
            try{
                setLoading(true);
                const unidades = await apiCall(`${API_URL}/api/procesos/unidades`,{});
                setUnidades(unidades);

            }catch(err){
                console.error("Error", err);
                setUnidades([]);
            }finally{
                setLoading(false);
            }
        }
        fetchDatosAux();
    },[]);

    useEffect(()=>{
        const fetchProcesos = async()=>{
            setLoadingProcesos(true);
            try{

                const data = await apiCall(`${API_URL}/api/procesos/listado`, {});

                if (Array.isArray(data)) {
                    setAllProcesos(data);
                } else if (data && data.procesos) {
                    setAllProcesos(data.procesos);
                } else {
                    setAllProcesos([]); 
                }
                
                setPage(1);

            }catch(err){
                console.error("Error cargando procesos", err);
                setAllProcesos([]);
            }finally{
                setLoadingProcesos(false);
            }
        }
        fetchProcesos();
    },[refreshTrigger]);

    // --- Paginación en Frontend ---
    const totalPages = Math.ceil(allProcesos.length / limit) || 1;
    
    const procesos = useMemo(() => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return allProcesos.slice(start, end);
    }, [allProcesos, page]);

    const addProceso = async (processData) => {
        const { data } = await apiCall(`${API_URL}/api/procesos/nuevo`, {method:'POST', body: JSON.stringify(processData)});
        refreshProcesos();
        return data;
    };

    return {
        allProcesos,
        procesos,
        unidades, 
        loading, 
        loadingProcesos, 
        page, 
        totalPages, 
        setPage,
        refreshProcesos
    }
}