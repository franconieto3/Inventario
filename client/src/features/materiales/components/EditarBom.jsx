import { useState } from "react";
import { apiCall } from "../../../services/api";
import Button from "../../../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function EditarBom({bom, onClose, onSuccess}){
    const [consumo, setConsumo] = useState(bom.consumo_teorico || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleQuantityChange = (value) => {
            const cantidad = parseFloat(value);
            setConsumo(isNaN(cantidad) ? '' : cantidad);
        };

    const handleSubmit = async () => {
        if (!consumo || consumo <= 0) {
            setError("La cantidad debe ser mayor a 0.");
            return;
        }

        const payload = {
            id_bom: bom.id_bom,
            consumo_teorico: consumo
        };

        try {
            setLoading(true);
            setError("");

            // Ajusta la ruta y el método HTTP según tu backend para la actualización
            await apiCall(`${API_URL}/api/materiales/bom`, {
                method: 'PUT', 
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (onSuccess) onSuccess();
            if (onClose) onClose();

        } catch (err) {
            setError(err.message || "Ocurrió un error al actualizar el material.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="modal-content">
                {error && <p className="form-error" style={{ marginBottom: '10px' }}>{error}</p>}

                {/* Reutilizamos el contenedor y las clases de AgregarMaterial para mantener el diseño */}
                <div className="material-list-container" style={{ minHeight: 'auto', maxHeight: 'none' }}>
                    <ul className="material-list">
                        <li className="material-item">
                            <span className="material-name">{bom.descripcion}</span>
                            
                            <div className="material-actions">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span>Consumo teórico: </span>
                                    <input 
                                        type="number" 
                                        min="0.01"
                                        step="any"
                                        className="shadcn-input"
                                        value={consumo}
                                        onChange={(e) => handleQuantityChange(e.target.value)}
                                        autoFocus
                                    />
                                    <span>{bom.unidad}</span>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="modal-footer">
                <Button variant="secondary" disabled={loading} onClick={handleSubmit}>
                    {loading ? "Guardando..." : "Guardar cambios"}
                </Button>
            </div>
        </>
    );
}
