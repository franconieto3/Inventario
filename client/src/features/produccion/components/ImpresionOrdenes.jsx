import Button from "../../../components/ui/Button";
import "./ImpresionOrdenes.css";

export function ImpresionOrdenes({ ordenesSeleccionadas }) {
    const handleImprimir = () => {
        if (ordenesSeleccionadas.length === 0) {
            alert("Seleccioná al menos una orden para imprimir.");
            return;
        }
        window.print();
    };

    return (
        <>
            <Button
                variant="outline"
                className="no-print"
                disabled={ordenesSeleccionadas.length === 0}
                onClick={handleImprimir}
            >
                Imprimir seleccionadas ({ordenesSeleccionadas.length})
            </Button>

            <div className="print-only">
                <h2>Detalle de órdenes de fabricación</h2>
                <table className="print-tabla">
                    <thead>
                        <tr>
                            <th>Pieza</th>
                            <th>Cantidad</th>
                            <th>ID Materia Prima</th>
                            <th>ID Orden de Producción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesSeleccionadas.map((orden) => (
                            <tr key={orden.id_of}>
                                <td>{orden.pieza?.producto?.nombre} {orden.pieza?.nombre}</td>
                                <td>{orden.cantidad}</td>
                                <td>{orden.id_materia_prima || "- - -"}</td>
                                <td>{orden.id_orden_produccion || "- - -"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
