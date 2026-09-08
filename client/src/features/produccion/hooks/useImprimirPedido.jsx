import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Req. 15: registra la auditoría de impresión (POST) y trae el detalle del pedido para
// armar la hoja, luego dispara window.print(). La auditoría registra la intención de
// imprimir (POST exitoso), no la confirmación del diálogo nativo del navegador: no hay
// forma cross-browser de detectar si el usuario efectivamente imprimió o canceló.
export const useImprimirPedido = () => {
    const [pedidoImprimir, setPedidoImprimir] = useState(null);
    const [imprimiendo, setImprimiendo] = useState(false);

    const solicitarImpresion = useCallback(async (idPedido) => {
        setImprimiendo(true);
        try {
            await apiCall(`${API_URL}/api/pedidos-fabricacion/${idPedido}/imprimir`, {
                method: 'POST'
            });
            const detalle = await apiCall(`${API_URL}/api/pedidos-fabricacion/${idPedido}`, {});
            setPedidoImprimir(detalle);
        } catch (err) {
            console.error("Error al imprimir el pedido de fabricación", err);
            alert(err.message || "Ocurrió un error al registrar la impresión del pedido.");
        } finally {
            setImprimiendo(false);
        }
    }, []);

    useEffect(() => {
        if (!pedidoImprimir) return;
        const id = requestAnimationFrame(() => window.print());
        return () => cancelAnimationFrame(id);
    }, [pedidoImprimir]);

    return { pedidoImprimir, imprimiendo, solicitarImpresion };
};
