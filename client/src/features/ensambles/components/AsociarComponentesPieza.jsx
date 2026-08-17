import { useEffect, useState } from "react";
import { BuscadorPiezas } from "../../products/components/BuscadorPiezas"; // Ajusta la ruta según tu estructura
import Button from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { ToggleSelector } from "../../../components/ui/ToggleSelector";

// Importamos los estilos nativos
import "./AgregarComponentes.css";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AsociarComponentesPieza({ producto, onClose, onSuccess }) {
    // Estado para los componentes a agregar y sus cantidades
    const [componentes, setComponentes] = useState([]);
    
    // Estado para las piezas "padre" seleccionadas donde se agregarán los componentes
    const [piezasSeleccionadas, setPiezasSeleccionadas] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(1);

    // --- LÓGICA DE COMPONENTES (Hijos) ---
    const handleSelectPart = (idComponente, nombreComponente) => {
        if (componentes.some(c => c.idComponente === idComponente)) return;
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

    // --- LÓGICA DE GUARDADO MASIVO ---
    const handleGuardar = async () => {
        // Validaciones combinadas
        if (componentes.length === 0) {
            setError("Debes agregar al menos un componente.");
            return;
        }
        if (componentes.some(c => !c.cantidad || c.cantidad < 1)) {
            setError("Todas las cantidades de componentes deben ser mayores a 0.");
            return;
        }
        if (piezasSeleccionadas.length === 0) {
            setError("Debes seleccionar al menos una pieza para asociar los componentes.");
            return;
        }

        setError("");
        setLoading(true);

        // Armado de la lista de componentes (común para todas las piezas padre)
        const componentesPayload = componentes.map(c => ({
            idComponente: c.idComponente,
            cantidad: c.cantidad
        }));

        try {
            await apiCall(`${API_URL}/api/componentes/bulk-load`, {
                method: 'POST',
                body: JSON.stringify({ idPiezasPadre: piezasSeleccionadas, componentes: componentesPayload }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (onSuccess) onSuccess();
            if (onClose) onClose();

        } catch (err) {
            setError(err.message || "Ocurrió un error al guardar las asociaciones.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Forzamos el re-render del buscador si es necesario, tal como lo hacías
        setReload(reload + 1);
    }, [componentes]);

    return (
        <Modal
            titulo="Asociar componentes masivamente"
            descripcion="Selecciona los componentes, define su cantidad y elige a qué piezas deseas ensamblarlos."
            onClose={onClose}
        >
            <div className="modal-content">
                
                {/* 1. SECCIÓN DE COMPONENTES */}
                <div style={{marginBottom: '20px'}}>
                    <BuscadorPiezas key={reload} onSelect={(id, value) => handleSelectPart(id, value)} />
                    
                    <div className="component-list-container" style={{ marginTop: '15px' }}>
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
                                                placeholder="Cantidad"
                                                value={c.cantidad}
                                                onChange={(e) => handleQuantityChange(c.idComponente, e.target.value)}
                                                style={{ width: '80px', marginRight: '10px' }}
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

                <ToggleSelector
                    titulo="Asociar a las siguientes piezas"
                    items={producto?.pieza || []}
                    idField={'id_pieza'}
                    displayField={(item) => `${producto?.nombre || ''} ${item.nombre}`}
                    selectedItems={piezasSeleccionadas}
                    onChangeSelection={setPiezasSeleccionadas}
                />
                
                {/* 3. MANEJO DE ERRORES Y ACCIONES */}
                {error && <div className="form-error ai-form-error" style={{marginTop: '15px', color: 'red'}}>{error}</div>}
                
                <div className="modal-footer" style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end'}}>
                    <Button variant="default" disabled={loading} onClick={handleGuardar}>
                        {loading ? "Guardando..." : "Guardar asociaciones"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}