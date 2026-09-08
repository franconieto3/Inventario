import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Req. 15: detalle de un pedido de fabricación (producto, órdenes, piezas, materia prima
// y repositorio por pieza), para la pantalla de detalle/escaneo. Cualquier usuario
// autenticado puede consultarlo.
export function usePedidoDetalle(idPedido) {
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchPedido = useCallback(async () => {
        if (!idPedido) return;
        setLoading(true);
        setError("");
        try {
            const data = await apiCall(`${API_URL}/api/pedidos-fabricacion/${idPedido}`, {});
            setPedido(data);
        } catch (err) {
            setError(err.message || "Ocurrió un error al obtener el detalle del pedido.");
            setPedido(null);
        } finally {
            setLoading(false);
        }
    }, [idPedido]);

    useEffect(() => {
        fetchPedido();
    }, [fetchPedido]);

    return { pedido, loading, error, refetch: fetchPedido };
}
