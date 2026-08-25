import Button from "../../../components/ui/Button";
import "./ImpresionOrdenes.css";
import logo from '../../../assets/logo.png';

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
                <div className="print-content-wrapper">
                    {/* --- ENCABEZADO TIPO EXCEL --- */}
                    <table className="print-header-table">
                        <tbody>
                            <tr>
                                <td className="header-logo-cell" rowSpan="3">
                                    <img src={logo} alt="Logo" />
                                </td>
                                <td className="header-title-cell" rowSpan="3">
                                    <h1>ORDEN DE PEDIDO DE PRODUCCION</h1>
                                </td>
                                <td className="header-meta-cell">CODIGO: F83</td>
                            </tr>
                            <tr>
                                <td className="header-meta-cell">PON: PG-001</td>
                            </tr>
                            <tr>
                                <td className="header-meta-cell">ANEXO: III</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* --- TABLA DE ÓRDENES --- */}
                    <table className="print-tabla">
                        <thead>
                            <tr>
                                <th>Emisión</th>
                                <th>Pieza</th>
                                <th>Cantidad</th>
                                <th>Codigo IR</th>
                                <th>O. de Producción</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Fin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordenesSeleccionadas.map((orden) => (
                                <tr key={orden.id_of}>
                                    <td>
                                        {orden.fecha_creacion 
                                            ? new Date(orden.fecha_creacion).toLocaleDateString("es-AR") 
                                            : "- - -"}
                                    </td>
                                    <td>{orden.pieza?.producto?.nombre} {orden.pieza?.nombre}</td>
                                    <td>{orden.cantidad}</td>
                                    <td>{orden.id_materia_prima || "- - -"}</td>
                                    <td>{orden.id_orden_produccion || "- - -"}</td>
                                    <td></td> {/* Columna vacía */}
                                    <td></td> {/* Columna vacía */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* --- PIE DE PÁGINA TIPO EXCEL --- */}
                <div className="print-footer">
                    <div className="footer-nota">
                        <span>NOTA:</span>
                        <div className="lineas-nota">
                            <div className="linea"></div>
                            <div className="linea"></div>
                            <div className="linea"></div>
                        </div>
                    </div>

                    <div className="footer-firmas">
                        <div className="firma-box">
                            <span>RECIBIO:</span>
                            <div className="linea-firma"></div>
                        </div>
                        <div className="firma-box-group">
                            <div className="firma-box">
                                <span>FIRMA:</span>
                                <div className="linea-firma"></div>
                            </div>
                            <div className="firma-box">
                                <span>FECHA:</span>
                                <div className="linea-firma"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
