import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import NavBar from "../../../components/layout/NavBar";

// Req. 15: pantalla de escaneo por cámara para operarios ya logueados en un dispositivo
// de planta. El QR codifica la URL de detalle del pedido; si por algún motivo se escanea
// solo el id_pedido pelado, también se resuelve.
export default function EscaneoPedido() {
    const navigate = useNavigate();
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
        scannerRef.current = scanner;

        const onScanSuccess = (decodedText) => {
            const match = decodedText.match(/\/pedidos-fabricacion\/(\d+)/);
            const idPelado = Number(decodedText);
            const id = match ? match[1] : (Number.isFinite(idPelado) && idPelado > 0 ? idPelado : null);

            if (id) {
                scanner.clear().catch(() => {});
                navigate(`/pedidos-fabricacion/${id}`);
            }
        };

        scanner.render(onScanSuccess, () => {});

        return () => {
            scannerRef.current?.clear().catch(() => {});
        };
    }, [navigate]);

    return (
        <>
            <NavBar />
            <div className="body-container">
                <h1 className="of-title">Escanear pedido de fabricación</h1>
                <div id="qr-reader" style={{ maxWidth: 500 }} />
            </div>
        </>
    );
}
