import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../../../services/api"; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useAccessRequests = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    
    // Estados de carga
    const [loadingRequests, setLoadingRequests] = useState(false);
    
    // Paginación
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const [selectedStatus, setSelectedStatus] = useState('PENDIENTE');

    // Mapeo estático de estados para el select (Ajusta los strings al ENUM de tu DB)
    const estados = [
        { id: 'TODOS', descripcion: 'Todos los estados' },
        { id: 'PENDIENTE', descripcion: 'Pendiente' },
        { id: 'APROBADA', descripcion: 'Aprobada' }, 
        { id: 'RECHAZADA', descripcion: 'Rechazada' },
        { id: 'REVOCADA', descripcion: 'Revocada' },
        { id: 'EXPIRADA', descripcion: 'Expirada' }
    ];

    const refreshRequests = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        const fetchRequests = async () => {
            setLoadingRequests(true);
            try {
                let query = `?page=${page}&limit=20`;
                // Si no es "TODOS", agregamos el filtro de estado a la query
                if (selectedStatus && selectedStatus !== 'TODOS') {
                    query += `&estado=${selectedStatus}`;
                }

                // Llamada a la API
                const response = await apiCall(`${API_URL}/api/documentos/solicitudes-acceso${query}`, {});

                // Ajustamos la lectura basándonos en la respuesta del servicio Node.js anterior
                if (response && response.success) {
                    setSolicitudes(response.data || []);
                    setTotalPages(response.meta?.totalPages || 1);
                } else if (response && Array.isArray(response.data)) {
                    // Fallback directo
                    setSolicitudes(response.data);
                    setTotalPages(response.meta?.totalPages || 1);
                } else if (Array.isArray(response)) {
                    setSolicitudes(response);
                    setTotalPages(1);
                } else {
                    setSolicitudes([]);
                }

            } catch (err) {
                console.error("Error cargando solicitudes de acceso", err);
                setSolicitudes([]);
            } finally {
                setLoadingRequests(false);
            }
        };
        fetchRequests();
    }, [page, selectedStatus, refreshTrigger]);

    return {
        solicitudes,
        estados,
        loadingRequests,
        page,
        totalPages,
        selectedStatus,
        setPage,
        setSelectedStatus,
        refreshRequests
    };
};