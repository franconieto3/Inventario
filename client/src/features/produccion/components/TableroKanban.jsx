import { ProductGroup } from "./ProductGroup";
import "./TableroKanban.css";

function agruparOrdenesPorPedido(ordenes) {
    const grupos = new Map();

    for (const orden of ordenes) {
        const idPedido = orden.id_pedido ?? "sin-pedido";
        const nombreProducto = orden.pieza?.producto?.nombre || "Sin producto";
        const fechaEntrega = orden.pedido_fabricacion?.fecha_entrega ?? null;
        const estadoPedido = orden.pedido_fabricacion?.id_estado_pedido ?? null;

        if (!grupos.has(idPedido)) {
            grupos.set(idPedido, { idPedido, nombreProducto, fechaEntrega, estadoPedido, ordenes: [] });
        }
        grupos.get(idPedido).ordenes.push(orden);
    }

    return Array.from(grupos.values());
}

export function TableroKanban({ columnas, actualizandoId, onGuardarOrdenProduccion, onCancelarOrden, onImprimir }) {
    return (
        <div className="kanban-board no-print">
            {columnas.map((col) => (
                <div key={col.estado} className="kanban-column">
                    <div className="kanban-column-header">
                        <h4>{col.titulo}</h4>
                        <span className="kanban-column-count">{col.ordenes.length}</span>
                    </div>

                    <div className="kanban-column-body">
                        {col.ordenes.length === 0 ? (
                            <p className="kanban-column-empty">Sin órdenes en esta etapa.</p>
                        ) : (
                            agruparOrdenesPorPedido(col.ordenes).map((grupo) => (
                                <ProductGroup
                                    key={grupo.idPedido}
                                    idPedido={grupo.idPedido}
                                    nombreProducto={grupo.nombreProducto}
                                    fechaEntrega={grupo.fechaEntrega}
                                    estadoPedido={grupo.estadoPedido}
                                    ordenes={grupo.ordenes}
                                    actualizandoId={actualizandoId}
                                    onGuardarOrdenProduccion={onGuardarOrdenProduccion}
                                    onCancelarOrden={onCancelarOrden}
                                    onImprimir={onImprimir}
                                />
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
