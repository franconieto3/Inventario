import { useCallback, useEffect, useState, useMemo } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useProcessRoutes(){
    
    //const [rutas, setRutas] = useState([]);
    const [allRutas, setAllRutas] = useState([])

    //Carga
    const [loading, setLoading] = useState(false);
    const [loadingRoutes, setLoadingRoutes] = useState(false);

    //Paginación
    const [page, setPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    //Categorización
    const [tipos, setTipos] = useState([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState(0);

    const refreshRutas = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    
    useEffect(()=>{
        const fetchDatosAux = async ()=>{
            try{
                setLoading(true);
                const data = await apiCall(`${API_URL}/api/procesos/tipos`,{});
                setTipos(data);
            }catch(err){
                console.error("Error", err);
                setTipos([]);
            }finally{
                setLoading(false);
            }
        }
        fetchDatosAux();
    },[]);

    useEffect(()=>{
        const fetchRoutes = async()=>{
            setLoadingRoutes(true);
            try{
                let query = ``
                const data = await apiCall(`${API_URL}/api/procesos/ruta/listado${query}`, {});

                if (data && data.rutas && Array.isArray(data.rutas)) {
                    setAllRutas(data.rutas);
                } else if (Array.isArray(data)) {
                    // Por si en el futuro modificas el backend para devolver el array directo
                    setAllRutas(data);
                } else {
                    setAllRutas([]); 
                }
                
            }catch(err){
                console.error("Error cargando rutas", err);
                setAllRutas([]);
            }finally{
                setLoadingRoutes(false);
            }
        }
        fetchRoutes();
    },[refreshTrigger]);

    // --- Paginación en Frontend ---

    const limit = 20;

    // 1. Primero filtramos todas las rutas basándonos en el tipo seleccionado
    const rutasFiltradas = useMemo(() => {
        const tipoId = Number(tipoSeleccionado); // Aseguramos que sea un número (el select devuelve string)
        
        if (tipoId === 0) {
            return allRutas; // "Todos los tipos"
        }

        return allRutas.filter(ruta => {
            const idTipoRuta = ruta.id_tipo_ruta || ruta.tipo_ruta?.id_tipo_ruta;
            return idTipoRuta === tipoId;
        });
    }, [allRutas, tipoSeleccionado]);

    const totalPages = Math.ceil(rutasFiltradas.length / limit) || 1;
    
    const rutas = useMemo(() => {
        const start = (page - 1) * limit;
        const end = start + limit;
        return rutasFiltradas.slice(start, end);
    }, [rutasFiltradas, page]);

    useEffect(() => {
        setPage(1);
    }, [tipoSeleccionado]);

    //Creación de rutas

    const crearRuta = useCallback( async (payload)=>{
        console.log("Enviando: ", payload);

        const res = await apiCall(`${API_URL}/api/procesos/ruta/pieza`,{
            method: 'POST',
            body: JSON.stringify({ruta: payload})
        })

        setRefreshTrigger(prev => prev + 1);
    },[])

    return {allRutas, rutas, tipos,loading, totalPages, page, loadingRoutes,tipoSeleccionado, setTipoSeleccionado, setLoadingRoutes, setPage, refreshRutas, crearRuta};
}