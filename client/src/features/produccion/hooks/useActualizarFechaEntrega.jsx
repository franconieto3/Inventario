import { useCallback, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Edición de fecha_entrega post-creación (dashboard de supervisión y detalle del
// pedido). fechaEntrega llega como string "yyyy-mm-dd" desde un <input type="date">,
// o "" para borrarla (se normaliza a null en el body).
export function useActualizarFechaEntrega() {
    const [actualizandoId, setActualizandoId] = useState(null);

    const actualizarFechaEntrega = useCallback(async (idPedido, fechaEntrega) => {
        setActualizandoId(idPedido);
        try {
            const data = await apiCall(`${API_URL}/api/pedidos-fabricacion/${idPedido}/fecha-entrega`, {
                method: 'PATCH',
                body: JSON.stringify({ fecha_entrega: fechaEntrega || null })
            });
            return data.pedido;
        } catch (err) {
            alert(err.message || "Ocurrió un error al actualizar la fecha de entrega.");
            return null;
        } finally {
            setActualizandoId(null);
        }
    }, []);

    return { actualizarFechaEntrega, actualizandoId };
}
