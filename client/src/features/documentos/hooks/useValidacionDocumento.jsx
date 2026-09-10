import { useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useValidacionDocumento(id) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelado = false;

        const fetchValidacion = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiCall(`${API_URL}/api/documentos/validacion-documento/${id}`, {});
                if (!cancelado) setData(res);
            } catch (err) {
                if (!cancelado) {
                    setError(
                        err.status === 404
                            ? 'La versión indicada no existe.'
                            : 'Ocurrió un error validando el documento.'
                    );
                }
            } finally {
                if (!cancelado) setLoading(false);
            }
        };

        fetchValidacion();

        return () => { cancelado = true; };
    }, [id]);

    return { data, loading, error };
}
