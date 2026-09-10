import { QRCodeSVG } from "qrcode.react";
import "./SelloDocumento.css";

const SelloDocumento = ({
    fecha,
    impresoPor,
    rutaDominio,
    idDocumento
}) => {
    const urlValidacion = `${rutaDominio.replace(/\/$/, "")}/validacion-documento/${idDocumento}`;

    return (
        <div className="sello-documento">
            
            {/* Lado Izquierdo: Textos */}
            <div className="sello-textos">
                
                <div className="sello-titulo">
                    COPIA CONTROLADA
                </div>

                <div className="sello-separador" />

                <div className="sello-datos">
                    <div className="sello-campo">
                        <span className="sello-label">
                            FECHA
                        </span>
                        <span className="sello-linea">
                            {fecha || ""}
                        </span>
                    </div>

                    <div className="sello-campo">
                        <span className="sello-label">
                            IMPRESO POR
                        </span>
                        <span className="sello-linea">
                            {impresoPor || ""}
                        </span>
                    </div>
                </div>

            </div>

            {/* Lado Derecho: Código QR Maximizado */}
            <div className="sello-qr">
                <QRCodeSVG
                    value={urlValidacion}
                    size={220}          /* Aumentamos el tamaño base */
                    level="M"
                    includeMargin={false} /* Desactivamos el margen del SVG para controlarlo con CSS */
                    style={{ width: "100%", height: "100%", display: "block" }} 
                />
            </div>
            
        </div>
    );
};

export default SelloDocumento;