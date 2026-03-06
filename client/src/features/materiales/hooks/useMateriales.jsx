import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useMateriales = () => {
  
    const [rubros, setRubros] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [materiales, setMateriales] = useState([]);
  
    //Carga
    const [loading, setLoading] = useState(false);
    const [loadingMaterials, setLoadingMaterials] = useState(false);

    //Paginación
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    //Categorización
    const [rubroSeleccionado, setRubroSeleccionado] = useState(0);

    const refreshMaterials = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

  useEffect(() => {
    const fetchRubros = async () => {
        try{
            setLoading(true);
            const  [dataRubros, dataUnidades] = await Promise.all(
                [apiCall(`${API_URL}/api/materiales/rubros`,{}),
                 apiCall(`${API_URL}/api/materiales/unidades`,{})  
                ]
            );
            setRubros(dataRubros);
            setUnidades(dataUnidades);
            
        }catch(err){
            console.log("Error obteniendo listado de materiales: ", err.message);
        }finally{
            setLoading(false);
        }
    }
    fetchRubros();
  }, []);

    useEffect(()=>{
        const fetchMaterials = async()=>{
            setLoadingMaterials(true);
            try{
                let query = `?page=${page}&limit=20`;
                if (rubroSeleccionado && rubroSeleccionado!=="0") query += `&id_rubro_material=${rubroSeleccionado}`;

                const data = await apiCall(`${API_URL}/api/materiales/listado${query}`, {});

                if (data && data.materiales && Array.isArray(data.materiales)) {
                    // CASO A: Paginación correcta { data: [], total: 100 }
                    setMateriales(data.materiales);
                    setTotalPages(data.totalPages || Math.ceil(data.total / 20));
                } else if (Array.isArray(data)) {
                    // CASO B: Devuelve array directo [{}, {}]
                    setMateriales(data);
                    setTotalPages(1);
                } else {
                    // CASO C: Formato desconocido o error -> Forzamos array vacío para evitar crash
                    console.warn("Formato de productos desconocido, se usará array vacío.");
                    setMateriales([]); 
                }


            }catch(err){
                console.error("Error cargando solicitudes", err);
            }finally{
                setLoadingMaterials(false);
            }
        }
        fetchMaterials();
    },[page,rubroSeleccionado, refreshTrigger]);


    const addMaterial = async (materialData) => {
        const { data } = await apiCall(`${API_URL}/api/materiales/nuevo`, {method:'POST', body: JSON.stringify(materialData)});
        refreshMaterials();
        return data;
    };

  return {
     rubros,
     unidades,
     materiales,
     loading,
     loadingMaterials,
     totalPages,
     page,
     setPage,
     setRubroSeleccionado,
     refreshMaterials,
     addMaterial };
};