import { useState, useCallback } from "react";
import { apiCall } from '../../../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function usePartDetail(idPieza){
    
const [pieza, setPieza] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchPart = useCallback(async () => {
        if (!idPieza) return;
        setLoading(true);
        try {
            const data = await apiCall(`${API_URL}/api/productos/pieza/${idPieza}`, {});
            setPieza(data);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [idPieza]);

    return { pieza, loading, fetchPart };
}
