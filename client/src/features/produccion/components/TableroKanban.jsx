import { ProductGroup } from "./ProductGroup";
import "./TableroKanban.css";

function agruparOrdenesPorProducto(ordenes) {
    const grupos = new Map();

    for (const orden of ordenes) {
        const idProducto = orden.pieza?.producto?.id_producto ?? "sin-producto";
        const nombreProducto = orden.pieza?.producto?.nombre || "Sin producto";

        if (!grupos.has(idProducto)) {
            grupos.set(idProducto, { idProducto, nombreProducto, ordenes: [] });
        }
        grupos.get(idProducto).ordenes.push(orden);
    }

    return Array.from(grupos.values());
}

export function TableroKanban({ columnas, seleccionadas, actualizandoId, onToggleSeleccion, onGuardarOrdenProduccion, onCancelarOrden }) {
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
                            agruparOrdenesPorProducto(col.ordenes).map((grupo) => (
                                <ProductGroup
                                    key={grupo.idProducto}
                                    nombreProducto={grupo.nombreProducto}
                                    ordenes={grupo.ordenes}
                                    seleccionadas={seleccionadas}
                                    actualizandoId={actualizandoId}
                                    onToggleSeleccion={onToggleSeleccion}
                                    onGuardarOrdenProduccion={onGuardarOrdenProduccion}
                                    onCancelarOrden={onCancelarOrden}
                                />
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
