import { useState } from "react";
import "./OrderCard.css";

export function OrderCard({ orden, seleccionada, actualizando, onToggleSeleccion, onGuardarOrdenProduccion }) {
    const [idOrdenProduccion, setIdOrdenProduccion] = useState(orden.id_orden_produccion || "");

    const deshabilitado = actualizando === orden.id_of;

    return (
        <div className={`order-card ${seleccionada ? "order-card-seleccionada" : ""}`}>
            <div className="order-card-header">
                <label className="order-card-checkbox">
                    <input
                        type="checkbox"
                        checked={seleccionada}
                        onChange={() => onToggleSeleccion(orden.id_of)}
                    />
                    <span>#{orden.id_of}</span>
                </label>
                {orden.id_of_padre && <span className="order-card-badge">Hija de #{orden.id_of_padre}</span>}
                {orden.a_medida && <span className="order-card-badge order-card-badge-medida">A medida</span>}
            </div>

            <p className="order-card-titulo">
                {orden.pieza?.producto?.nombre} {orden.pieza?.nombre}
            </p>

            <div className="order-card-detalle">
                <span>Cantidad: <strong>{orden.cantidad}</strong></span>
                <span>Ruta: <strong>{orden.ruta_procesos?.nombre || "- - -"}</strong></span>
                <span>Materia prima: <strong>{orden.id_materia_prima || "- - -"}</strong></span>
            </div>

            <div className="order-card-orden-produccion">
                <input
                    type="text"
                    className="shadcn-input"
                    placeholder="ID orden de producción"
                    value={idOrdenProduccion}
                    disabled={deshabilitado}
                    onChange={(e) => setIdOrdenProduccion(e.target.value)}
                />
                <button
                    disabled={deshabilitado || !idOrdenProduccion || idOrdenProduccion === orden.id_orden_produccion}
                    onClick={() => onGuardarOrdenProduccion(orden.id_of, idOrdenProduccion)}
                >
                    Guardar
                </button>
            </div>
        </div>
    );
}
