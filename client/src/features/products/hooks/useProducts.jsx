import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useProducts = () => {
    // 1. Estados separados para datos auxiliares y principales
    const [productos, setProductos] = useState([]);
    const [rubros, setRubros] = useState([]);
    const [registrosPM, setRegistrosPM] = useState([]);
    
    const [selectedRubro, setSelectedRubro] = useState(null);
    const [selectedRegistroPM, setSelectedRegistroPM] = useState(null);

    // Estados de carga independientes
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingAux, setLoadingAux] = useState(false); // Para rubros y PM
    
    // Paginación (Estado local)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Función para recargar manualmente (útil tras crear/editar)
    
    const refreshProducts = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // Funciones para manejar los filtros y resetear la página a 1
    const handleSetRubro = (id) => {
        setSelectedRubro(id); // Asumiendo que 0 es "limpiar filtro"
        setPage(1);
    };

    const handleSetRegistroPM = (id) => {
        setSelectedRegistroPM(id);
        setPage(1);
        
    };

    // 2. EFECTO 1: Cargar datos auxiliares (Solo una vez al montar)
    // Esto es rápido y habilita los filtros casi instantáneamente.
    useEffect(() => {
        const fetchAuxData = async () => {
            setLoadingAux(true);
            try {
                // Estos suelen ser ligeros, está bien usar Promise.all aquí
                const [dataRubros, dataPM] = await Promise.all([
                    apiCall(`${API_URL}/api/productos/rubros`, {}),
                    apiCall(`${API_URL}/api/productos/registros-pm`, {})
                ]);
                setRubros(dataRubros);
                setRegistrosPM(dataPM);
            } catch (err) {
                console.error("Error cargando filtros", err);
            } finally {
                setLoadingAux(false);
            }
        };
        fetchAuxData();
    }, []);

    // 3. EFECTO 2: Cargar Productos (Depende de la página)
    useEffect(() => {
        const fetchProductos = async () => {
            setLoadingProducts(true);
            try {
                let query = `?page=${page}&limit=20`;
                if (selectedRubro) query += `&rubro=${selectedRubro}`;
                if (selectedRegistroPM) query += `&registro_pm=${selectedRegistroPM}`;

                const data = await apiCall(`${API_URL}/api/productos${query}`, {});

                if (data && data.data && Array.isArray(data.data)) {
                    // CASO A: Paginación correcta { data: [], total: 100 }
                    setProductos(data.data);
                    setTotalPages(Math.ceil(data.total / 20));
                } else if (Array.isArray(data)) {
                    // CASO B: Devuelve array directo [{}, {}]
                    setProductos(data);
                    setTotalPages(1);
                } else {
                    // CASO C: Formato desconocido o error -> Forzamos array vacío para evitar crash
                    console.warn("Formato de productos desconocido, se usará array vacío.");
                    setProductos([]); 
                }

            } catch (err) {
                console.error("Error cargando productos", err);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchProductos();
    }, [page, refreshTrigger,selectedRubro, selectedRegistroPM]); // Se vuelve a ejecutar si cambia la página

    return { 
        productos, 
        rubros, 
        registrosPM, 
        loadingProducts, // Usar para spinner de la tabla
        loadingAux,      // Usar para deshabilitar filtros mientras cargan
        page,
        setPage,
        totalPages,
        refreshProducts,
        handleSetRubro,
        handleSetRegistroPM
    };
};