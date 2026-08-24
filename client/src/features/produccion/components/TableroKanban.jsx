import { OrderCard } from "./OrderCard";
import "./TableroKanban.css";

export function TableroKanban({ columnas, seleccionadas, actualizandoId, onToggleSeleccion, onGuardarOrdenProduccion }) {
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
                            col.ordenes.map((orden) => (
                                <OrderCard
                                    key={orden.id_of}
                                    orden={orden}
                                    seleccionada={seleccionadas.has(orden.id_of)}
                                    actualizando={actualizandoId}
                                    onToggleSeleccion={onToggleSeleccion}
                                    onGuardarOrdenProduccion={onGuardarOrdenProduccion}
                                />
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
