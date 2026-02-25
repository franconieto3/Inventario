import { useCallback, useEffect, useState } from "react"
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useChangeRequest = ()=>{
    const [solicitudes, setSolicitudes] = useState([]);
    const [estados, setEstados] = useState([]);
    
    //Estados de carga
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [loadingAux, setLoadingAux] = useState(false);
    
    //Paginación
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    //Categorización
    const [selectedStatus, setSelectedStatus] = useState(0);

    const refreshRequests = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        const fetchAuxData = async () => {
            setLoadingAux(true);
            try {
                const {data} = await apiCall(`${API_URL}/api/documentos/estados-solicitud`,{});
                setEstados(data);

            } catch (err) {
                console.error("Error cargando estados", err);
            } finally {
                setLoadingAux(false);
            }
        };
        fetchAuxData();
    }, []);

    useEffect(()=>{
        const fetchRequests = async()=>{
            setLoadingRequests(true);
            try{
                let query = `?page=${page}&limit=20`;
                if (selectedStatus && selectedStatus!=="0") query += `&status=${selectedStatus}`;

                const data = await apiCall(`${API_URL}/api/documentos/solicitud-cambio${query}`, {});

                if (data && data.data && Array.isArray(data.data)) {
                    // CASO A: Paginación correcta { data: [], total: 100 }
                    setSolicitudes(data.data);
                    setTotalPages(Math.ceil(data.total / 20));
                } else if (Array.isArray(data)) {
                    // CASO B: Devuelve array directo [{}, {}]
                    setSolicitudes(data);
                    setTotalPages(1);
                } else {
                    // CASO C: Formato desconocido o error -> Forzamos array vacío para evitar crash
                    console.warn("Formato de productos desconocido, se usará array vacío.");
                    setSolicitudes([]); 
                }


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
        loadingAux,
        page,
        totalPages,
        selectedStatus,
        setPage,
        setSelectedStatus,
        refreshRequests
    };
}