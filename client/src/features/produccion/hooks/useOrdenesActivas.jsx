import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Ver server/services/ordenFabricacion.service.js: el id 3 pasa a ser "En Producción"
// y "Aceptada" es una fila nueva (id 7), sin renumerar los estados existentes.
export const ESTADO_PENDIENTE_DISENO = 1;
export const ESTADO_PENDIENTE_MATERIALES = 2;
export const ESTADO_EN_PRODUCCION = 3;
export const ESTADO_ACEPTADA = 7;

export const useOrdenesActivas = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [loadingOrdenes, setLoadingOrdenes] = useState(false);
    const [actualizandoId, setActualizandoId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [seleccionadas, setSeleccionadas] = useState(new Set());

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

    const toggleSeleccion = useCallback((idOf) => {
        setSeleccionadas(prev => {
            const next = new Set(prev);
            if (next.has(idOf)) next.delete(idOf);
            else next.add(idOf);
            return next;
        });
    }, []);

    const limpiarSeleccion = useCallback(() => setSeleccionadas(new Set()), []);

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

    const aceptarPedido = useCallback(async (idPedido) => {
        setActualizandoId(`pedido-${idPedido}`);
        try {
            await apiCall(`${API_URL}/api/pedidos-fabricacion/${idPedido}/aceptar`, {
                method: 'PATCH'
            });
            refreshOrdenes();
            return true;
        } catch (err) {
            console.error("Error al aceptar el pedido de fabricación", err);
            alert(err.message || "Ocurrió un error al aceptar el pedido de fabricación.");
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

    const ordenesSeleccionadas = ordenes.filter(o => seleccionadas.has(o.id_of));

    // Un pedido está listo para aceptarse cuando está Pendiente (id_estado_pedido 1)
    // y todas sus órdenes activas ya están validadas en diseño y materiales
    // (Pendiente Materiales + id_materia_prima asignado).
    const pedidosListos = new Set();
    const ordenesPorPedido = new Map();
    for (const orden of ordenes) {
        if (!orden.id_pedido) continue;
        if (!ordenesPorPedido.has(orden.id_pedido)) ordenesPorPedido.set(orden.id_pedido, []);
        ordenesPorPedido.get(orden.id_pedido).push(orden);
    }
    for (const [idPedido, ordenesDelPedido] of ordenesPorPedido) {
        const estadoPedido = ordenesDelPedido[0]?.pedido_fabricacion?.id_estado_pedido;
        const listo = estadoPedido === 1 && ordenesDelPedido.every(
            o => o.id_estado_of === ESTADO_PENDIENTE_MATERIALES && !!o.id_materia_prima
        );
        if (listo) pedidosListos.add(idPedido);
    }

    return {
        ordenes,
        columnas,
        loadingOrdenes,
        actualizandoId,
        seleccionadas,
        ordenesSeleccionadas,
        toggleSeleccion,
        limpiarSeleccion,
        guardarOrdenProduccion,
        cancelarOrden,
        aceptarPedido,
        pedidosListos,
        refreshOrdenes
    };
};
