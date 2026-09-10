import { useCallback, useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Req. 12: arma, a partir de las cantidades ingresadas por pieza y las sugerencias de
// composición aprobadas/descartadas por el supervisor, el lote plano que espera
// fn_crear_ordenes_fabricacion_masivo: cada ítem indica opcionalmente la posición
// (id_padre_ref) de otro ítem anterior del mismo lote del cual es hijo. Un nodo cuyo
// padre no quedó incluido (porque fue descartado, o porque su propio padre lo fue) se
// descarta en cascada de forma natural: nunca se registra en el mapa de índices, así
// que ningún hijo suyo puede resolver su id_padre_ref y también queda afuera.
function construirLoteOrdenes(piezasState, sugerenciasPorPieza, aprobadasPorPieza) {
    const ordenes = [];

    for (const [idPiezaStr, estado] of Object.entries(piezasState)) {
        const cantidad = Number(estado.cantidad);
        if (!(cantidad > 0)) continue;

        const idPieza = Number(idPiezaStr);
        const indiceRaiz = ordenes.length;
        ordenes.push({ id_pieza: idPieza, cantidad, a_medida: Boolean(estado.a_medida), id_padre_ref: null });

        const sugerencias = sugerenciasPorPieza[idPieza];
        if (!sugerencias || sugerencias.length === 0) continue;

        const aprobadas = aprobadasPorPieza[idPieza] || new Set();
        const indicePorRuta = new Map([[String(idPieza), indiceRaiz]]);

        for (const nodo of sugerencias) {
            const rutaKey = nodo.ruta.join('.');
            const rutaPadreKey = nodo.ruta_padre.join('.');

            const indicePadre = indicePorRuta.get(rutaPadreKey);
            if (indicePadre === undefined) continue; // padre descartado: se descarta en cascada
            if (!aprobadas.has(rutaKey)) continue; // esta sugerencia fue descartada

            const indiceActual = ordenes.length;
            ordenes.push({
                id_pieza: nodo.id_pieza,
                cantidad: nodo.cantidad,
                a_medida: false,
                id_padre_ref: indicePadre
            });
            indicePorRuta.set(rutaKey, indiceActual);
        }
    }

    return ordenes;
}

export const useGenerarOrdenFabricacion = () => {
    const [productos, setProductos] = useState([]);
    const [loadingProductos, setLoadingProductos] = useState(false);

    const [producto, setProducto] = useState(null);
    const [piezasState, setPiezasState] = useState({});
    const [loadingPiezas, setLoadingPiezas] = useState(false);
    const [errorPiezas, setErrorPiezas] = useState("");
    const [fechaEntrega, setFechaEntrega] = useState("");

    const [revisando, setRevisando] = useState(false);
    const [loadingSugerencias, setLoadingSugerencias] = useState(false);
    const [sugerenciasPorPieza, setSugerenciasPorPieza] = useState({});
    const [aprobadasPorPieza, setAprobadasPorPieza] = useState({});

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
            setRevisando(false);
            setSugerenciasPorPieza({});
            setAprobadasPorPieza({});

        } catch (err) {
            setErrorPiezas(err.message || "Ocurrió un error al obtener las piezas del producto.");
            setProducto(null);
            setPiezasState({});
        } finally {
            setLoadingPiezas(false);
        }
    }, []);

    // Cambiar cantidades/a_medida después de revisar invalida la revisión anterior:
    // las sugerencias fueron calculadas para otras cantidades.
    const actualizarCantidad = useCallback((idPieza, valor) => {
        const cantidad = valor === "" ? 0 : Number(valor);
        setPiezasState((prev) => ({
            ...prev,
            [idPieza]: { ...prev[idPieza], cantidad: isNaN(cantidad) ? 0 : cantidad }
        }));
        setRevisando(false);
    }, []);

    const actualizarAMedida = useCallback((idPieza, valor) => {
        setPiezasState((prev) => ({
            ...prev,
            [idPieza]: { ...prev[idPieza], a_medida: valor }
        }));
        setRevisando(false);
    }, []);

    const reset = useCallback(() => {
        setProducto(null);
        setPiezasState({});
        setErrorPiezas("");
        setSubmitError("");
        setFechaEntrega("");
        setRevisando(false);
        setSugerenciasPorPieza({});
        setAprobadasPorPieza({});
    }, []);

    const volverAEditar = useCallback(() => {
        setRevisando(false);
        setSugerenciasPorPieza({});
        setAprobadasPorPieza({});
    }, []);

    const toggleAprobado = useCallback((idPiezaRaiz, ruta, aprobado) => {
        const rutaKey = ruta.join('.');
        const prefijo = `${rutaKey}.`;

        setAprobadasPorPieza((prev) => {
            const actual = new Set(prev[idPiezaRaiz] || []);
            if (aprobado) {
                actual.add(rutaKey);
            } else {
                // Descartar un nodo descarta también a todos sus descendientes.
                for (const key of actual) {
                    if (key === rutaKey || key.startsWith(prefijo)) actual.delete(key);
                }
            }
            return { ...prev, [idPiezaRaiz]: actual };
        });
    }, []);

    // Devuelve 'error' (submitError ya seteado), 'sin-ensambles' (nada que revisar,
    // el llamador debe seguir directo con confirmarYGenerar) o 'revision' (se cargaron
    // las sugerencias y se pasó a la vista de revisión).
    const iniciarRevision = useCallback(async () => {
        setSubmitError("");

        const piezasSeleccionadas = Object.entries(piezasState)
            .filter(([, v]) => Number(v.cantidad) > 0)
            .map(([id_pieza, v]) => ({ id_pieza: Number(id_pieza), cantidad: Number(v.cantidad), a_medida: Boolean(v.a_medida) }));

        if (piezasSeleccionadas.length === 0) {
            setSubmitError("Debés ingresar una cantidad mayor a 0 para al menos una pieza.");
            return 'error';
        }

        const piezasEnsamble = piezasSeleccionadas.filter((p) => {
            const piezaInfo = producto?.pieza?.find((pp) => pp.id_pieza === p.id_pieza);
            return piezaInfo?.es_ensamble;
        });

        if (piezasEnsamble.length === 0) {
            return 'sin-ensambles';
        }

        setLoadingSugerencias(true);
        try {
            const data = await apiCall(`${API_URL}/api/ordenes-fabricacion/sugerencias-composicion`, {
                method: 'POST',
                body: JSON.stringify({ piezas: piezasEnsamble.map(({ id_pieza, cantidad }) => ({ id_pieza, cantidad })) })
            });

            const sugerenciasMap = {};
            const aprobadasMap = {};
            
            console.log("Sugerencias: ", data);

            (data?.sugerencias || []).forEach(({ raiz_id_pieza, componentes }) => {
                sugerenciasMap[raiz_id_pieza] = componentes;
                aprobadasMap[raiz_id_pieza] = new Set(componentes.map((c) => c.ruta.join('.')));
            });

            setSugerenciasPorPieza(sugerenciasMap);
            setAprobadasPorPieza(aprobadasMap);
            setRevisando(true);
            return 'revision';
        } catch (err) {
            setSubmitError(err.message || "Ocurrió un error al calcular las sugerencias de componentes.");
            return 'error';
        } finally {
            setLoadingSugerencias(false);
        }
    }, [piezasState, producto]);

    const confirmarYGenerar = useCallback(async () => {
        setSubmitError("");
        setSubmitting(true);
        try {
            const ordenes = construirLoteOrdenes(piezasState, sugerenciasPorPieza, aprobadasPorPieza);

            const data = await apiCall(`${API_URL}/api/pedidos-fabricacion`, {
                method: 'POST',
                body: JSON.stringify({
                    fecha_entrega: fechaEntrega,
                    ordenes
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            reset();
            return data;

        } catch (err) {
            setSubmitError(err.message || "Ocurrió un error al generar el pedido de fabricación.");
            return null;
        } finally {
            setSubmitting(false);
        }
    }, [piezasState, sugerenciasPorPieza, aprobadasPorPieza, fechaEntrega, reset]);

    return {
        productos,
        loadingProductos,
        producto,
        piezasState,
        loadingPiezas,
        errorPiezas,
        fechaEntrega,
        setFechaEntrega,
        revisando,
        loadingSugerencias,
        sugerenciasPorPieza,
        aprobadasPorPieza,
        submitting,
        submitError,
        seleccionarProducto,
        actualizarCantidad,
        actualizarAMedida,
        iniciarRevision,
        toggleAprobado,
        volverAEditar,
        confirmarYGenerar
    };
};
