import { useEffect, useState } from "react";
import { BuscadorPiezas } from "../../products/components/BuscadorPiezas";
import { apiCall } from "../../../services/api";
import Button from "../../../components/ui/Button";

// Importamos los estilos nativos
import "./AgregarComponentes.css";


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AgregarComponentes({ onClose, onSuccess, idPiezaPadre }) {
    const [componentes, setComponentes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(1);

    const handleSelectPart = (idComponente, nombreComponente) => {
        // Evitar duplicados
        if (componentes.some(c => c.idComponente === idComponente)) return;
        
        // Inicializamos la cantidad en 1 por defecto
        setComponentes((prev) => [...prev, { idComponente, nombreComponente, cantidad: 1 }]);
    };

    const handleRemovePart = (idComponente) => {
        setComponentes((prev) => prev.filter(c => c.idComponente !== idComponente));
    };

    const handleQuantityChange = (idComponente, value) => {
        const cantidad = parseInt(value, 10);
        setComponentes((prev) => prev.map(c => 
            c.idComponente === idComponente 
                ? { ...c, cantidad: isNaN(cantidad) ? '' : cantidad } 
                : c
        ));
    };

    const submitComponents = async () => {
        // Validaciones
        if (componentes.length === 0) {
            setError("Debes agregar al menos un componente.");
            return;
        }
        
        if (componentes.some(c => !c.cantidad || c.cantidad < 1)) {
            setError("Todas las cantidades deben ser mayores a 0.");
            return;
        }

        // Limpiar errores previos y setear loading
        setError("");
        setLoading(true);

        // Armado del body
        const body = {
            idPiezaPadre,
            componentes: componentes.map(c => ({
                idComponente: c.idComponente,
                cantidad: c.cantidad
            }))
        };
        
        try {
            // Ajustar el endpoint según tu backend (ej: '/piezas/componentes')
            const res = await apiCall(`${API_URL}/api/componentes/new`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Si hay onSuccess prop, la llamamos para refrescar la UI padre
            if (onSuccess) onSuccess();
            
            // Cerramos el modal
            if (onClose) onClose();

        } catch (err) {
            setError(err.message || "Ocurrió un error al guardar los componentes.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // console.log(componentes);
        setReload(reload + 1);

    }, [componentes]);

    return (
        <div className="overlay">
            <div className="modal">
                
                {/* Cabecera y Botón de cierre del modal */}
                <div className="modal-header">
                    <h3 className="modal-title">Agregar Componentes</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                        &times;
                    </button>
                </div>
                <div className="modal-content">
                    <BuscadorPiezas key={reload} onSelect={(id, value) => handleSelectPart(id, value)} />
                    
                    {error && <p className="form-error">{error}</p>}

                    <div className="component-list-container">
                        {componentes.length === 0 ? (
                            <p className="empty-state">No hay componentes agregados aún.</p>
                        ) : (
                            <ul className="component-list">
                                {componentes.map((c) => (
                                    <li key={c.idComponente} className="component-item">
                                        <span className="component-name">{c.nombreComponente}</span>
                                        <div className="component-actions">
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="shadcn-input"
                                                value={c.cantidad}
                                                onChange={(e) => handleQuantityChange(c.idComponente, e.target.value)}
                                            />
                                            <button 
                                                className="delete-btn" 
                                                onClick={() => handleRemovePart(c.idComponente)}
                                                title="Eliminar componente"
                                            >
                                                <i className="material-icons">delete</i>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <Button variant="secondary" disabled={loading} onClick={submitComponents}>
                        {loading ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </div>
        </div>
    );
}