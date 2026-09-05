import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useOrdenesMateriales = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loadingOrdenes, setLoadingOrdenes] = useState(false);
    const [actualizandoId, setActualizandoId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshOrdenes = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        const fetchOrdenes = async () => {
            setLoadingOrdenes(true);
            try {
                const data = await apiCall(`${API_URL}/api/ordenes-fabricacion/pendientes-materiales`, {});
                setOrdenes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error cargando órdenes pendientes de materiales", err);
            } finally {
                setLoadingOrdenes(false);
            }
        };
        fetchOrdenes();
    }, [refreshTrigger]);

    const agregarMateriaPrima = useCallback(async (idOf, identificador) => {
        if (!identificador) return false;

        setActualizandoId(idOf);
        try {
            await apiCall(`${API_URL}/api/ordenes-fabricacion/${idOf}/materia-prima`, {
                method: 'POST',
                body: JSON.stringify({ identificador })
            });
            refreshOrdenes();
            return true;
        } catch (err) {
            console.error("Error al agregar el identificador de materia prima", err);
            alert(err.message || "Ocurrió un error al agregar el identificador de materia prima.");
            return false;
        } finally {
            setActualizandoId(null);
        }
    }, [refreshOrdenes]);

    const eliminarMateriaPrima = useCallback(async (idOf, idMateriaPrima) => {
        setActualizandoId(idOf);
        try {
            await apiCall(`${API_URL}/api/ordenes-fabricacion/${idOf}/materia-prima/${idMateriaPrima}`, {
                method: 'DELETE'
            });
            refreshOrdenes();
            return true;
        } catch (err) {
            console.error("Error al eliminar el identificador de materia prima", err);
            alert(err.message || "Ocurrió un error al eliminar el identificador de materia prima.");
            return false;
        } finally {
            setActualizandoId(null);
        }
    }, [refreshOrdenes]);

    const toggleAprobacionMateriales = useCallback(async (idOf, aprobar) => {
        setActualizandoId(idOf);
        try {
            await apiCall(`${API_URL}/api/ordenes-fabricacion/${idOf}`, {
                method: 'PATCH',
                body: JSON.stringify({ materiales_aprobados: aprobar })
            });
            refreshOrdenes();
            return true;
        } catch (err) {
            console.error("Error al actualizar la aprobación de materiales", err);
            alert(err.message || "Ocurrió un error al actualizar la aprobación de materiales.");
            return false;
        } finally {
            setActualizandoId(null);
        }
    }, [refreshOrdenes]);

    const guardarOrdenProduccion = useCallback(async (idOf, idOrdenProduccion) => {
        if (!idOrdenProduccion) return false;

        setActualizandoId(idOf);
        try {
            await apiCall(`${API_URL}/api/ordenes-fabricacion/${idOf}`, {
                method: 'PATCH',
                body: JSON.stringify({ id_orden_produccion: idOrdenProduccion })
            });
            refreshOrdenes();
            return true;
        } catch (err) {
            console.error("Error al guardar la orden de producción", err);
            alert(err.message || "Ocurrió un error al guardar el identificador de orden de producción.");
            return false;
        } finally {
            setActualizandoId(null);
        }
    }, [refreshOrdenes]);

    return {
        ordenes,
        loadingOrdenes,
        actualizandoId,
        agregarMateriaPrima,
        eliminarMateriaPrima,
        toggleAprobacionMateriales,
        guardarOrdenProduccion,
        refreshOrdenes
    };
};
