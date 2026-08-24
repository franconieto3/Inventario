import { useState, useCallback } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function usePartMaterials(idPieza) {
    const [materiales, setMateriales] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchMateriales = useCallback(async () => {
        if (!idPieza) return;
        setLoading(true);
        try {
            const data = await apiCall(`${API_URL}/api/materiales/pieza/${idPieza}`, {});
            setMateriales(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [idPieza]);

    return { materiales, loading, fetchMateriales };
}
