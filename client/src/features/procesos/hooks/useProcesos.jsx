import { useCallback, useEffect, useState } from "react"
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useProcesos(){

    const [rutas, setRutas] = useState([
        {
          id_ruta:1,
          nombre: "Tornillos canulados"  
        },
        {
            id_ruta: 2,
            nombre: "Placas de titanio"
        },
        {
            id_ruta: 3,
            nombre: "Tallos de cadera acero"
        }
    ])

    const [procesos, setProcesos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [unidades, setUnidades] = useState([]);
    
    //Carga
    const [loading, setLoading] = useState(false);
    const [loadingProcesos, setLoadingProcesos] = useState(false);

    //Paginación
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    //Categorización
    const [tipoSeleccionado, setTipoSeleccionado] = useState(0);

    const refreshProcesos = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(()=>{
        const fetchDatosAux = async ()=>{
            try{
                setLoading(true);
                const [dataTipos, dataUnidades] = await Promise.all(
                    [
                        apiCall(`${API_URL}/api/procesos/tipos`,{}),
                        apiCall(`${API_URL}/api/procesos/unidades`,{})
                    ]
                )
                setTipos(dataTipos);
                setUnidades(dataUnidades);

            }catch(err){

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
                let query = `?page=${page}&limit=20`;
                if (tipoSeleccionado && tipoSeleccionado!=="0") query += `&id_tipo_proceso=${tipoSeleccionado}`;
                const data = await apiCall(`${API_URL}/api/procesos/listado${query}`, {});

                if (data && data.procesos && Array.isArray(data.procesos)) {
                    // CASO A: Paginación correcta { data: [], total: 100 }
                    setProcesos(data.procesos);
                    setTotalPages(data.totalPages || Math.ceil(data.total / 20));
                } else if (Array.isArray(data)) {
                    // CASO B: Devuelve array directo [{}, {}]
                    setProcesos(data);
                    setTotalPages(1);
                } else {
                    // CASO C: Formato desconocido o error -> Forzamos array vacío para evitar crash
                    console.warn("Formato de productos desconocido, se usará array vacío.");
                    setProcesos([]); 
                }


            }catch(err){
                console.error("Error cargando procesos", err);
            }finally{
                setLoadingProcesos(false);
            }
        }
        fetchProcesos();
    },[page, tipoSeleccionado, refreshTrigger]);


    const addProceso = async (processData) => {
        const { data } = await apiCall(`${API_URL}/api/procesos/nuevo`, {method:'POST', body: JSON.stringify(processData)});
        refreshProcesos();
        return data;
    };

    return {procesos, tipos, unidades, rutas, loading, loadingProcesos, page, totalPages, tipoSeleccionado, setPage, setTotalPages, setTipoSeleccionado, refreshProcesos}
}