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

    const aprobarMateriales = useCallback(async (idOf, idMateriaPrima) => {
        if (!idMateriaPrima) {
            alert("Debe ingresar el identificador de la materia prima.");
            return false;
        }

        setActualizandoId(idOf);
        try {
            await apiCall(`${API_URL}/api/ordenes-fabricacion/${idOf}`, {
                method: 'PATCH',
                body: JSON.stringify({ id_materia_prima: idMateriaPrima, id_estado_of: 3 })
            });
            refreshOrdenes();
            return true;
        } catch (err) {
            console.error("Error al aprobar los materiales de la orden", err);
            alert(err.message || "Ocurrió un error al aprobar los materiales.");
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
        aprobarMateriales,
        guardarOrdenProduccion,
        refreshOrdenes
    };
};
