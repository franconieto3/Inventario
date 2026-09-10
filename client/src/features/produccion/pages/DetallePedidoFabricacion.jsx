import { useParams } from "react-router-dom";
import NavBar from "../../../components/layout/NavBar";
import { usePedidoDetalle } from "../hooks/usePedidoDetalle";
import { useActualizarFechaEntrega } from "../hooks/useActualizarFechaEntrega";
import { RepositorioPieza } from "../components/RepositorioPieza";
import { FechaEntregaEditable } from "../components/FechaEntregaEditable";
import "./DetallePedidoFabricacion.css";

const DESCRIPCION_ESTADO_PEDIDO = {
    1: "Pendiente",
    2: "Aceptado",
    3: "En Producción",
    4: "Finalizado",
    5: "Cancelado"
};

export default function DetallePedidoFabricacion() {
    const { id } = useParams();
    const { pedido, loading, error, refetch } = usePedidoDetalle(id);
    const { actualizarFechaEntrega, actualizandoId } = useActualizarFechaEntrega();

    const handleGuardarFechaEntrega = async (idPedido, fechaEntrega) => {
        const data = await actualizarFechaEntrega(idPedido, fechaEntrega);
        if (data) await refetch();
        return Boolean(data);
    };

    return (
        <>
            <NavBar />
            <div className="body-container">
                <h1 className="of-title">Detalle de pedido de fabricación</h1>

                {loading && <p className="text-muted">Cargando pedido...</p>}
                {!loading && error && <p className="form-error">{error}</p>}

                {!loading && pedido && (
                    <div className="detalle-pedido">
                        <div className="detalle-pedido-header">
                            <h2>{pedido.producto?.nombre}</h2>
                            <div className="badge-group">
                                <span className="order-card-badge">
                                    Estado: {DESCRIPCION_ESTADO_PEDIDO[pedido.id_estado_pedido] || pedido.id_estado_pedido}
                                </span>
                                <FechaEntregaEditable
                                    idPedido={pedido.id_pedido}
                                    fechaEntrega={pedido.fecha_entrega}
                                    actualizando={actualizandoId === pedido.id_pedido}
                                    onGuardar={handleGuardarFechaEntrega}
                                />
                            </div>
                        </div>

                        {/* Pasamos todas las órdenes juntas al componente */}
                        {pedido.orden_fabricacion && pedido.orden_fabricacion.length > 0 && (
                            <RepositorioPieza 
                                ordenes={pedido.orden_fabricacion} 
                                producto={pedido.producto} 
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
