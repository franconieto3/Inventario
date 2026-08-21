import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useGenerarOrdenFabricacion = () => {
    const [productos, setProductos] = useState([]);
    const [loadingProductos, setLoadingProductos] = useState(false);

    const [producto, setProducto] = useState(null);
    const [piezasState, setPiezasState] = useState({});
    const [loadingPiezas, setLoadingPiezas] = useState(false);
    const [errorPiezas, setErrorPiezas] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        const fetchProductos = async () => {
            setLoadingProductos(true);
            try {
                const data = await apiCall(`${API_URL}/api/productos?limit=1000`, {});
                setProductos(Array.isArray(data?.data) ? data.data : []);
            } catch (err) {
                console.error("Error cargando productos", err);
            } finally {
                setLoadingProductos(false);
            }
        };
        fetchProductos();
    }, []);

    const seleccionarProducto = useCallback(async (idProducto) => {
        setErrorPiezas("");
        setSubmitError("");
        setLoadingPiezas(true);
        try {
            const data = await apiCall(`${API_URL}/api/productos/${idProducto}`, {});
            setProducto(data);

            const estadoInicial = {};
            (data?.pieza || []).forEach((p) => {
                estadoInicial[p.id_pieza] = { cantidad: 0, a_medida: false };
            });
            setPiezasState(estadoInicial);

        } catch (err) {
            setErrorPiezas(err.message || "Ocurrió un error al obtener las piezas del producto.");
            setProducto(null);
            setPiezasState({});
        } finally {
            setLoadingPiezas(false);
        }
    }, []);

    const actualizarCantidad = useCallback((idPieza, valor) => {
        const cantidad = valor === "" ? 0 : Number(valor);
        setPiezasState((prev) => ({
            ...prev,
            [idPieza]: { ...prev[idPieza], cantidad: isNaN(cantidad) ? 0 : cantidad }
        }));
    }, []);

    const actualizarAMedida = useCallback((idPieza, valor) => {
        setPiezasState((prev) => ({
            ...prev,
            [idPieza]: { ...prev[idPieza], a_medida: valor }
        }));
    }, []);

    const reset = useCallback(() => {
        setProducto(null);
        setPiezasState({});
        setErrorPiezas("");
        setSubmitError("");
    }, []);

    const submitOrdenes = useCallback(async () => {
        setSubmitError("");

        const ordenes = Object.entries(piezasState)
            .filter(([, v]) => Number(v.cantidad) > 0)
            .map(([id_pieza, v]) => ({
                id_pieza: Number(id_pieza),
                cantidad: Number(v.cantidad),
                a_medida: Boolean(v.a_medida)
            }));

        if (ordenes.length === 0) {
            setSubmitError("Debés ingresar una cantidad mayor a 0 para al menos una pieza.");
            return null;
        }

        setSubmitting(true);
        try {
            const data = await apiCall(`${API_URL}/api/ordenes-fabricacion/bulk`, {
                method: 'POST',
                body: JSON.stringify({ ordenes }),
                headers: { 'Content-Type': 'application/json' }
            });

            reset();
            return data;

        } catch (err) {
            setSubmitError(err.message || "Ocurrió un error al generar las órdenes de fabricación.");
            return null;
        } finally {
            setSubmitting(false);
        }
    }, [piezasState, reset]);

    return {
        productos,
        loadingProductos,
        producto,
        piezasState,
        loadingPiezas,
        errorPiezas,
        submitting,
        submitError,
        seleccionarProducto,
        actualizarCantidad,
        actualizarAMedida,
        submitOrdenes
    };
};
