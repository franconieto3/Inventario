import { useState } from "react";
import { OrderCard } from "./OrderCard";
import "./ProductGroup.css";

export function ProductGroup({
    idPedido,
    nombreProducto,
    fechaEntrega,
    ordenes,
    seleccionadas,
    actualizandoId,
    onToggleSeleccion,
    onGuardarOrdenProduccion,
    onCancelarOrden
}) {
    const [expandido, setExpandido] = useState(false);

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
            </div>

            {expandido && (
                <div className="product-group-body">
                    {ordenes.map((orden) => (
                        <OrderCard
                            key={orden.id_of}
                            orden={orden}
                            seleccionada={seleccionadas.has(orden.id_of)}
                            actualizando={actualizandoId}
                            onToggleSeleccion={onToggleSeleccion}
                            onGuardarOrdenProduccion={onGuardarOrdenProduccion}
                            onCancelarOrden={onCancelarOrden}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
