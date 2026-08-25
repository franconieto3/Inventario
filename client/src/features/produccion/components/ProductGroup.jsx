import { useState } from "react";
import { OrderCard } from "./OrderCard";
import "./ProductGroup.css";

export function ProductGroup({ nombreProducto, ordenes, seleccionadas, actualizandoId, onToggleSeleccion, onGuardarOrdenProduccion, onCancelarOrden }) {
    const [expandido, setExpandido] = useState(false);

    return (
        <div className="product-group">
            <button
                type="button"
                className="product-group-header"
                onClick={() => setExpandido(prev => !prev)}
            >
                <span className={`product-group-caret ${expandido ? "product-group-caret-abierto" : ""}`}>▸</span>
                <span className="product-group-nombre">{nombreProducto}</span>
                <span className="product-group-count">{ordenes.length}</span>
            </button>

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
