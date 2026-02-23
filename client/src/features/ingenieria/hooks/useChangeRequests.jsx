import { useCallback, useEffect, useState } from "react"
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useChangeRequest = ()=>{
    const [solicitudes, setSolicitudes] = useState(null)

    const [loadingRequests, setLoadingRequests] = useState(false);

    const [page, setPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshRequests = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(()=>{
        const fetchRequests = async()=>{
            setLoadingRequests(true);
            try{
                const query = `?page=${page}&limit=20`; 
                const data = await apiCall(`${API_URL}/api/documentos/solicitud-cambio${query}`, {});
                
                setSolicitudes(data.data || []);

            }catch(err){
                console.error("Error cargando productos", err);
            }finally{
                setLoadingRequests(false);
            }
        }
        fetchRequests();
    },[page, refreshTrigger]);

    useEffect(()=>{console.log(solicitudes)},[solicitudes]);

    return{
        solicitudes,
        loadingRequests,
        page,
        setPage,
        refreshRequests
    };
}