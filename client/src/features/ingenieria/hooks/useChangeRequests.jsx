import { useCallback, useEffect, useState } from "react"
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useChangeRequest = ()=>{
    const [solicitudes, setSolicitudes] = useState([]);
    const [estados, setEstados] = useState([]);

    const [loadingRequests, setLoadingRequests] = useState(false);

    const [page, setPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [selectedStatus, setSelectedStatus] = useState(null);

    const refreshRequests = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(()=>{
        const fetchRequests = async()=>{
            setLoadingRequests(true);
            try{
                let query = `?page=${page}&limit=20`;
                if (selectedStatus && selectedStatus!=="0") query += `&status=${selectedStatus}`;

                const data = await apiCall(`${API_URL}/api/documentos/solicitud-cambio${query}`, {});
                
                setSolicitudes(data.data || []);

            }catch(err){
                console.error("Error cargando solicitudes", err);
            }finally{
                setLoadingRequests(false);
            }
        }
        fetchRequests();
    },[page,selectedStatus, refreshTrigger]);


    return{
        solicitudes,
        estados,
        loadingRequests,
        page,
        setPage,
        setSelectedStatus,
        refreshRequests
    };
}