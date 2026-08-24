import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useValidacionDiseno = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loadingOrdenes, setLoadingOrdenes] = useState(false);

    const [rutasPorPieza, setRutasPorPieza] = useState({});
    const [loadingRutasPieza, setLoadingRutasPieza] = useState({});

    const [actualizandoId, setActualizandoId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshOrdenes = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        const fetchOrdenes = async () => {
            setLoadingOrdenes(true);
            try {
                const data = await apiCall(`${API_URL}/api/ordenes-fabricacion/pendientes-diseno`, {});
                setOrdenes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error cargando órdenes pendientes de diseño", err);
            } finally {
                setLoadingOrdenes(false);
            }
        };
        fetchOrdenes();
    }, [refreshTrigger]);

    // Trae las rutas asociadas a una pieza (para el selector), buscando la de
    // fecha de vigencia más reciente por defecto (Req. 5)
    const cargarRutasPieza = useCallback(async (idPieza) => {
        if (rutasPorPieza[idPieza] || loadingRutasPieza[idPieza]) return;

        setLoadingRutasPieza(prev => ({ ...prev, [idPieza]: true }));
        try {
            const data = await apiCall(`${API_URL}/api/ordenes-fabricacion/rutas-pieza/${idPieza}`, {});
            const rutas = Array.isArray(data) ? data : [];
            const rutasOrdenadas = [...rutas].sort(
                (a, b) => new Date(b.fecha_vigencia) - new Date(a.fecha_vigencia)
            );
            setRutasPorPieza(prev => ({ ...prev, [idPieza]: rutasOrdenadas }));
        } catch (err) {
            console.error("Error cargando rutas de la pieza", err);
            setRutasPorPieza(prev => ({ ...prev, [idPieza]: [] }));
        } finally {
            setLoadingRutasPieza(prev => ({ ...prev, [idPieza]: false }));
        }
    }, [rutasPorPieza, loadingRutasPieza]);

    const validarDiseno = useCallback(async (orden, idRutaSeleccionada) => {
        const idRuta = orden.id_ruta || idRutaSeleccionada;

        if (!idRuta) {
            alert("Debe asignar una ruta de fabricación antes de validar el diseño.");
            return false;
        }

        setActualizandoId(orden.id_of);
        try {
            const body = { id_estado_of: 2 };
            if (!orden.id_ruta) body.id_ruta = idRuta;

            await apiCall(`${API_URL}/api/ordenes-fabricacion/${orden.id_of}`, {
                method: 'PATCH',
                body: JSON.stringify(body)
            });

            refreshOrdenes();
            return true;
        } catch (err) {
            console.error("Error al validar el diseño", err);
            alert(err.message || "Ocurrió un error al validar el diseño de la orden.");
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

    useEffect(()=>console.log(ordenes),[ordenes]);
    
    return {
        ordenes,
        loadingOrdenes,
        rutasPorPieza,
        loadingRutasPieza,
        actualizandoId,
        cargarRutasPieza,
        validarDiseno,
        guardarOrdenProduccion,
        refreshOrdenes
    };
};
