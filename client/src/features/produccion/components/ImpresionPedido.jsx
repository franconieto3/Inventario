import { QRCodeSVG } from "qrcode.react";
import "./ImpresionOrdenes.css";
import logo from '../../../assets/logo.png';

export function ImpresionPedido({ pedido }) {
    if (!pedido) return null;

    const qrValue = `${window.location.origin}/pedidos-fabricacion/${pedido.id_pedido}`;
    const ordenes = pedido.orden_fabricacion || [];

    return (
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

                <div style={{border:'1px solid grey',borderRadius:'10px', padding:'60px', width:'auto'}}>
                    <p style={{fontSize:'1.5rem', marginBottom:'40px'}}>{pedido.producto?.nombre}</p>
                    <QRCodeSVG value={qrValue} size={200} />
                    <p className="header-qr-url">{qrValue}</p>
                </div>

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
    );
}
