import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const ESTADO_PENDIENTE_DISENO = 1;
export const ESTADO_PENDIENTE_MATERIALES = 2;
export const ESTADO_EN_PRODUCCION = 3;
export const ESTADO_ACEPTADA = 7;

export const useOrdenesActivas = () => {
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
                const data = await apiCall(`${API_URL}/api/ordenes-fabricacion/activas`, {});
                setOrdenes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error cargando órdenes activas", err);
            } finally {
                setLoadingOrdenes(false);
            }
        };
        fetchOrdenes();
    }, [refreshTrigger]);

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

    const cancelarOrden = useCallback(async (idOf) => {
        setActualizandoId(idOf);
        try {
            await apiCall(`${API_URL}/api/ordenes-fabricacion/${idOf}/cancelar`, {
                method: 'PATCH'
            });
            refreshOrdenes();
            return true;
        } catch (err) {
            console.error("Error al cancelar la orden de fabricación", err);
            alert(err.message || "Ocurrió un error al cancelar la orden de fabricación.");
            return false;
        } finally {
            setActualizandoId(null);
        }
    }, [refreshOrdenes]);

    const columnas = [
        { estado: ESTADO_PENDIENTE_DISENO, titulo: "Validación de diseño" },
        { estado: ESTADO_PENDIENTE_MATERIALES, titulo: "Validación de materiales" },
        { estado: ESTADO_ACEPTADA, titulo: "Aceptada" },
        { estado: ESTADO_EN_PRODUCCION, titulo: "En producción" }
    ].map(col => ({
        ...col,
        ordenes: ordenes.filter(o => o.id_estado_of === col.estado)
    }));

    return {
        ordenes,
        columnas,
        loadingOrdenes,
        actualizandoId,
        guardarOrdenProduccion,
        cancelarOrden,
        refreshOrdenes
    };
};
