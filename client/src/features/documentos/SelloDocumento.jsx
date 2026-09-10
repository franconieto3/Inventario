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

            {/* Encabezado */}
            <div className="sello-titulo">
                COPIA CONTROLADA
            </div>

            <div className="sello-separador" />

            {/* Contenido */}
            <div className="sello-contenido">

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

                {/* QR */}
                <div className="sello-qr">
                    <QRCodeSVG
                        value={urlValidacion}
                        size={95}
                        level="M"
                        includeMargin={true}
                    />
                </div>

            </div>
        </div>
    );
};

export default SelloDocumento;