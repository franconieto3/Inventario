import { useState } from "react";
import { OrderCard } from "./OrderCard";
import Button from "../../../components/ui/Button";
import Can from "../../../components/Can";
import { ESTADOS_PEDIDO_IMPRIMIBLES } from "../constants/estadosPedido";
import "./ProductGroup.css";

export function ProductGroup({
    idPedido,
    nombreProducto,
    fechaEntrega,
    estadoPedido,
    ordenes,
    actualizandoId,
    onGuardarOrdenProduccion,
    onCancelarOrden,
    onImprimir
}) {
    const [expandido, setExpandido] = useState(false);

    const tienePedido = idPedido && idPedido !== "sin-pedido";
    const puedeImprimir = tienePedido && ESTADOS_PEDIDO_IMPRIMIBLES.includes(estadoPedido);

    return (
        <div className="product-group">
            <div
                role="button"
                tabIndex={0}
                className="product-group-header"
                onClick={() => setExpandido(prev => !prev)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setExpandido(prev => !prev);
                }}
            >
                <span className={`product-group-caret ${expandido ? "product-group-caret-abierto" : ""}`}>▸</span>
                <span className="product-group-nombre">
                    {nombreProducto}
                    {fechaEntrega && (
                        <span className="order-card-badge" style={{marginLeft:'8px'}}>
                            Entrega: {new Date(fechaEntrega).toLocaleDateString("es-AR", { timeZone: "UTC" })}
                        </span>
                    )}
                    {!idPedido || idPedido === "sin-pedido" ? (
                        <span className="order-card-badge" style={{marginLeft:'8px'}}>Sin pedido (legado)</span>
                    ) : null}
                </span>
                <span className="product-group-count">{ordenes.length}</span>

                {puedeImprimir && (
                    <Can permission="imprimir_pedido_fabricacion">
                        <Button
                            variant="outline"
                            size="icon"
                            className="no-print"
                            title="Imprimir pedido"
                            aria-label="Imprimir pedido"
                            onClick={(e) => { e.stopPropagation(); onImprimir(idPedido); }}
                        >
                            <i className="material-icons">print</i>
                        </Button>
                    </Can>
                )}
            </div>

            {expandido && (
                <div className="product-group-body">
                    {ordenes.map((orden) => (
                        <OrderCard
                            key={orden.id_of}
                            orden={orden}
                            actualizando={actualizandoId}
                            onGuardarOrdenProduccion={onGuardarOrdenProduccion}
                            onCancelarOrden={onCancelarOrden}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
