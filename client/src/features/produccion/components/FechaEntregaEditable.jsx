import { useState } from "react";
import Button from "../../../components/ui/Button";
import Can from "../../../components/Can";
import "./FechaEntregaEditable.css";

function formatFecha(fecha) {
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString("es-AR", { timeZone: "UTC" });
}

// Fecha de entrega editable in-place, usada tanto en el dashboard de supervisión
// (ProductGroup) como en el detalle del pedido (DetallePedidoFabricacion). El campo es
// opcional: guardar con el input vacío borra la fecha (fecha_entrega queda null).
export function FechaEntregaEditable({ idPedido, fechaEntrega, actualizando, onGuardar, badgeClassName = "order-card-badge outline" }) {
    const [editando, setEditando] = useState(false);
    const [valor, setValor] = useState(fechaEntrega ? fechaEntrega.slice(0, 10) : "");

    const detenerPropagacion = (e) => e.stopPropagation();

    const iniciarEdicion = (e) => {
        e.stopPropagation();
        setValor(fechaEntrega ? fechaEntrega.slice(0, 10) : "");
        setEditando(true);
    };

    const cancelar = (e) => {
        e.stopPropagation();
        setEditando(false);
    };

    const guardar = async (e) => {
        e.stopPropagation();
        const ok = await onGuardar(idPedido, valor);
        if (ok) setEditando(false);
    };

    if (editando) {
        return (
            <span className="fecha-entrega-editable no-print" onClick={detenerPropagacion}>
                <input
                    type="date"
                    className="date-input"
                    value={valor}
                    disabled={actualizando}
                    onChange={(e) => setValor(e.target.value)}
                />
                <Button variant="outline" size="icon" title="Guardar" disabled={actualizando} onClick={guardar}>
                    <i className="material-icons">check</i>
                </Button>
                <Button variant="outline" size="icon" title="Cancelar" disabled={actualizando} onClick={cancelar}>
                    <i className="material-icons">close</i>
                </Button>
            </span>
        );
    }

    const textoFecha = formatFecha(fechaEntrega);

    return (
        <span className={`${badgeClassName} fecha-entrega-badge`} onClick={detenerPropagacion}>
            {textoFecha ? `Entrega: ${textoFecha}` : "Sin fecha de entrega"}
            <Can permission="editar_pedido_fabricacion">
                <button
                    type="button"
                    className="fecha-entrega-editar-btn no-print"
                    title="Editar fecha de entrega"
                    aria-label="Editar fecha de entrega"
                    onClick={iniciarEdicion}
                >
                    <i className="material-icons">edit</i>
                </button>
            </Can>
        </span>
    );
}
