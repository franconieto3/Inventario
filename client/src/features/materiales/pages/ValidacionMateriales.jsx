import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../components/layout/NavBar";
import Table from "../../../components/ui/Table";
import Button from "../../../components/ui/Button";
import { useOrdenesMateriales } from "../hooks/useOrdenesMateriales";
import { DetalleMaterialesPieza } from "../components/DetalleMaterialesPieza";
import "./ValidacionMateriales.css";
import Can from "../../../components/Can";

function FilaAcciones({ orden, actualizando, onAgregarMateriaPrima, onEliminarMateriaPrima, onToggleAprobacion, onGuardarOrdenProduccion }) {
    const [nuevoIdentificador, setNuevoIdentificador] = useState("");
    const [idOrdenProduccion, setIdOrdenProduccion] = useState(orden.id_orden_produccion || "");

    const deshabilitado = actualizando === orden.id_of;
    const identificadores = orden.orden_fabricacion_materia_prima || [];

    const handleAgregar = async () => {
        if (!nuevoIdentificador) return;
        const ok = await onAgregarMateriaPrima(orden.id_of, nuevoIdentificador);
        if (ok) setNuevoIdentificador("");
    };

    return (
        <div className="vm-acciones" style={{alignItems:'center'}}>
            {/*Especificación de IR*/}
            <div className="vm-campo">
                <label>Identificadores de materia prima</label>
                {identificadores.length > 0 && (
                    <ul className="vm-lista-materia-prima">
                        {identificadores.map((item) => (
                            <li key={item.id_materia_prima}>
                                <span>{item.identificador}</span>
                                <button
                                    type="button"
                                    className="vm-btn-quitar"
                                    disabled={deshabilitado}
                                    onClick={() => onEliminarMateriaPrima(orden.id_of, item.id_materia_prima)}
                                    aria-label={`Quitar ${item.identificador}`}
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="vm-fila-input">
                    <input
                        type="text"
                        className="shadcn-input"
                        placeholder="ID materia prima"
                        value={nuevoIdentificador}
                        disabled={deshabilitado}
                        onChange={(e) => setNuevoIdentificador(e.target.value)}
                    />
                    <button
                        className="vm-btn-secundario"
                        disabled={deshabilitado || !nuevoIdentificador}
                        onClick={handleAgregar}
                    >
                        Agregar
                    </button>
                </div>
            </div>
            {/*Especificación de OP*/}
            <div className="vm-campo">
                <label>Orden de producción (opcional)</label>
                <div className="vm-fila-input">
                    <input
                        type="text"
                        className="shadcn-input"
                        placeholder="ID orden de producción"
                        value={idOrdenProduccion}
                        disabled={deshabilitado}
                        onChange={(e) => setIdOrdenProduccion(e.target.value)}
                    />
                    <button
                        className="vm-btn-secundario"
                        disabled={deshabilitado || !idOrdenProduccion || idOrdenProduccion === orden.id_orden_produccion}
                        onClick={() => onGuardarOrdenProduccion(orden.id_of, idOrdenProduccion)}
                    >
                        Guardar
                    </button>
                </div>
            </div>
            <div className="wm-campo">
                <label className="vm-checkbox">
                    <input
                        type="checkbox"
                        style={{width:'18px', height:'18px'}}
                        checked={!!orden.materiales_aprobados}
                        disabled={deshabilitado || (!orden.materiales_aprobados && identificadores.length === 0)}
                        onChange={(e) => onToggleAprobacion(orden.id_of, e.target.checked)}
                    />
                    Materiales aprobados
                </label>
            </div>
        </div>
    );
}

export function ValidacionMateriales() {
    const navigate = useNavigate();
    const {
        ordenes,
        loadingOrdenes,
        actualizandoId,
        agregarMateriaPrima,
        eliminarMateriaPrima,
        toggleAprobacionMateriales,
        guardarOrdenProduccion
    } = useOrdenesMateriales();

    const columnas = [
        {
            key: "id_of",
            header: "Orden",
            render: (_, row) => (
                <span>
                    #{_}{row.id_of_padre ? <span className="vm-badge-hija"> (hija de #{row.id_of_padre})</span> : null}
                </span>
            )
        },
        {
            key: "",
            header: "Producto / Pieza",
            render: (_, row) => (
                <span onClick={()=>navigate(`/producto/${row.pieza.id_producto}`)} style={{'cursor':'pointer'}}>
                    {row.pieza?.producto?.nombre} {row.pieza?.nombre}
                </span>
            )
        },
        { key: "cantidad", header: "Cantidad" },
        {
            key: "",
            header: "Ruta de fabricación",
            render: (_, row) => row.ruta_procesos?.nombre || "- - -"
        },
        {
            key: "",
            header: "Listado de materiales",
            render: (_, row) => <DetalleMaterialesPieza pieza={row.pieza} />
        },
        {
            key: "",
            header: "Validación de materiales",
            render: (_, row) => (
                <FilaAcciones
                    orden={row}
                    actualizando={actualizandoId}
                    onAgregarMateriaPrima={agregarMateriaPrima}
                    onEliminarMateriaPrima={eliminarMateriaPrima}
                    onToggleAprobacion={toggleAprobacionMateriales}
                    onGuardarOrdenProduccion={guardarOrdenProduccion}
                />
            )
        }
    ];

    return (
        <>
            <NavBar />
            <div className="body-container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap:'wrap' }}>
                    <div>
                        <p className='products-text' style={{textAlign:'start'}}>Compras</p>
                        <p className="table-description">
                            Órdenes de fabricación pendientes de confirmación de materia prima.
                        </p>
                    </div>
                    <div style={{marginTop:'20px'}}>
                        <Can permission="acceso_materiales">
                            <Button variant="default" onClick={() => navigate('/materiales')}>
                                Listado de materiales
                            </Button>
                        </Can>
                    </div>
                </div>

                {loadingOrdenes ? (
                    <p className="loading-state">Cargando órdenes...</p>
                ) : (
                    <Table data={ordenes} columns={columnas} />
                )}
            </div>
        </>
    );
}
