import { useEffect, useState } from "react";
import Table from "../../../components/ui/Table";
import { useValidacionDiseno } from "../hooks/useValidacionDiseno";
import "./ValidacionDiseno.css";
import Button from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";

function FilaAcciones({ orden, rutas, loadingRutas, actualizando, onCargarRutas, onValidar, onGuardarOrdenProduccion }) {
    const [idRutaSeleccionada, setIdRutaSeleccionada] = useState("");
    const [idOrdenProduccion, setIdOrdenProduccion] = useState(orden.id_orden_produccion || "");

    useEffect(() => {
        if (!orden.id_ruta) onCargarRutas(orden.pieza.id_pieza);
    }, [orden.pieza.id_pieza, orden.id_ruta, onCargarRutas]);

    const rutaAsignada = orden.ruta_procesos?.nombre;
    const deshabilitado = actualizando === orden.id_of;

    return (
        <div className="validacion-diseno-acciones">
            {/*Ruta de fabricación*/}
            <div className="vd-campo">
                {rutaAsignada ? (
                    <span className="vd-ruta-asignada">{rutaAsignada}</span>
                ) : (
                    <select
                        value={idRutaSeleccionada}
                        disabled={deshabilitado || loadingRutas}
                        onChange={(e) => setIdRutaSeleccionada(e.target.value)}
                    >
                        <option value="">
                            {loadingRutas ? "Cargando rutas..." : (rutas?.length ? "Seleccionar ruta" : "Sin rutas disponibles")}
                        </option>
                        {(rutas || []).map((r) => (
                            <option key={r.id_ruta} value={r.id_ruta}>
                                {r.nombre} ({new Date(r.fecha_vigencia).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                )}
            </div>
            {/*Orden de producción*/}
            <div className="vd-campo">
                <label>Orden de producción (opcional)</label>
                <div className="vd-orden-produccion">
                    <input
                        type="text"
                        className="shadcn-input"
                        placeholder="ID orden de producción"
                        value={idOrdenProduccion}
                        disabled={deshabilitado}
                        onChange={(e) => setIdOrdenProduccion(e.target.value)}
                    />
                    <Button
                        variant="secondary"
                        disabled={deshabilitado || !idOrdenProduccion || idOrdenProduccion === orden.id_orden_produccion}
                        onClick={() => onGuardarOrdenProduccion(orden.id_of, idOrdenProduccion)}
                    >
                        Guardar
                    </Button>
                </div>
            </div>

            <label className="vd-checkbox">
                <input
                    type="checkbox"
                    disabled={deshabilitado || (!orden.id_ruta && !idRutaSeleccionada)}
                    checked={false}
                    onChange={() => onValidar(orden, idRutaSeleccionada)}
                />
                Diseño validado
            </label>
        </div>
    );
}

export function ValidacionDiseno() {

    const navigate = useNavigate();

    const {
        ordenes,
        loadingOrdenes,
        rutasPorPieza,
        loadingRutasPieza,
        actualizandoId,
        cargarRutasPieza,
        validarDiseno,
        guardarOrdenProduccion
    } = useValidacionDiseno();

    const columnas = [
        {
            key: "id_of",
            header: "Orden",
            render: (_, row) => (
                <span>
                    #{_}{row.id_of_padre ? <span className="vd-badge-hija"> (hija de #{row.id_of_padre})</span> : null}
                </span>
            )
        },
        {
            key: "",
            header: "Producto / Pieza",
            render: (_, row) => (
                <span onClick={()=>navigate(`/producto/${row.pieza.id_producto}`)} style={{'cursor':'pointer'}}>
                    {row.pieza?.producto?.nombre} {row.pieza?.nombre}
                    {row.pieza?.es_ensamble && <span className="vd-badge-ensamble">Ensamble</span>}
                </span>
            )
        },
        { key: "cantidad", header: "Cantidad" },
        {
            key: "a_medida",
            header: "A medida",
            render: (_) => (_ ? "Sí" : "No")
        },
        {
            key: "",
            header: "Validación de diseño",
            render: (_, row) => (
                <FilaAcciones
                    orden={row}
                    rutas={rutasPorPieza[row.pieza.id_pieza]}
                    loadingRutas={!!loadingRutasPieza[row.pieza.id_pieza]}
                    actualizando={actualizandoId}
                    onCargarRutas={cargarRutasPieza}
                    onValidar={validarDiseno}
                    onGuardarOrdenProduccion={guardarOrdenProduccion}
                />
            )
        }
    ];

    return (
        <>
            <div style={{ display: 'flex', textAlign: 'start', alignItems: 'center', width: '100%', marginBottom: '20px', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ fontWeight: '500' }}>Órdenes pendientes de validación de diseño</h3>
                    <p className="table-description">
                        Cada orden (incluidas las generadas por explosión de ensambles) se valida individualmente.
                    </p>
                </div>
            </div>

            {loadingOrdenes ? (
                <p className="loading-state">Cargando órdenes...</p>
            ) : (
                <Table data={ordenes} columns={columnas} />
            )}
        </>
    );
}
