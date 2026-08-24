import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../components/layout/NavBar";
import Table from "../../../components/ui/Table";
import Button from "../../../components/ui/Button";
import { useOrdenesMateriales } from "../hooks/useOrdenesMateriales";
import { DetalleMaterialesPieza } from "../components/DetalleMaterialesPieza";
import "./ValidacionMateriales.css";
import Can from "../../../components/Can";

function FilaAcciones({ orden, actualizando, onAprobar, onGuardarOrdenProduccion }) {
    const [idMateriaPrima, setIdMateriaPrima] = useState(orden.id_materia_prima || "");
    const [idOrdenProduccion, setIdOrdenProduccion] = useState(orden.id_orden_produccion || "");

    const deshabilitado = actualizando === orden.id_of;

    return (
        <div className="vm-acciones" style={{alignItems:'center', justifyContent:'space-between'}}>
            {/*Especificación de IR*/}
            <div className="vm-campo">
                <label>ID materia prima</label>
                <div className="vm-fila-input">
                    <input
                        type="text"
                        className="shadcn-input"
                        placeholder="ID materia prima"
                        value={idMateriaPrima}
                        disabled={deshabilitado}
                        onChange={(e) => setIdMateriaPrima(e.target.value)}
                    />
                    <button
                        className="vm-btn-aprobar"
                        disabled={deshabilitado || !idMateriaPrima}
                        onClick={() => onAprobar(orden.id_of, idMateriaPrima)}
                    >
                        Aprobar
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
        </div>
    );
}

export function ValidacionMateriales() {
    const navigate = useNavigate();
    const {
        ordenes,
        loadingOrdenes,
        actualizandoId,
        aprobarMateriales,
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
            header: "Detalle",
            render: (_, row) => <DetalleMaterialesPieza pieza={row.pieza} />
        },
        {
            key: "",
            header: "Validación de materiales",
            render: (_, row) => (
                <FilaAcciones
                    orden={row}
                    actualizando={actualizandoId}
                    onAprobar={aprobarMateriales}
                    onGuardarOrdenProduccion={guardarOrdenProduccion}
                />
            )
        }
    ];

    return (
        <>
            <NavBar />
            <div className="body-container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <div>
                        <p className='products-text' style={{textAlign:'start'}}>Compras</p>
                        <p className="table-description">
                            Órdenes de fabricación pendientes de confirmación de materia prima.
                        </p>
                    </div>
                    <Can permission="acceso_materiales">
                        <Button variant="default" onClick={() => navigate('/materiales')}>
                            Listado de materiales
                        </Button>
                    </Can>
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
