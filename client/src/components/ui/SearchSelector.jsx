import { useState } from "react";
import Buscador from "./Buscador"; // Ajusta la ruta de importación según tu estructura
import "./SearchSelector.css";

export function SearchSelector({
    opciones = [],
    initialSelections = [],
    placeholder = "Buscar elementos...",
    keys,
    idField,
    displayField,
    showId = false,
    maxSelections = Infinity,
    onSelectionChange
}) {
    const [selecciones, setSelecciones] = useState(initialSelections);
    const [reload, setReload] = useState(1);
    const [error, setError] = useState("");

    const handleSelect = (id, value, item) => {
        setError("");

        setSelecciones((prev) => {
            // Validar límite de selecciones
            if (prev.length >= maxSelections) {
                setError(`Se ha alcanzado el límite máximo de ${maxSelections} selecciones.`);
                return prev;
            }

            // Evitar duplicados
            const alreadyExists = prev.some(e => e[idField] === id);
            if (alreadyExists) {
                return prev;
            }

            const nuevasSelecciones = [...prev, item];
            
            // Notificar al padre
            if (onSelectionChange) {
                onSelectionChange(nuevasSelecciones);
            }
            
            return nuevasSelecciones;
        });

        // Forzar el re-render del Buscador para limpiar su input
        setReload((prev) => prev + 1);
    };

    const handleRemove = (id) => {
        setError("");
        setSelecciones((prev) => {
            const nuevasSelecciones = prev.filter(e => e[idField] !== id);
            
            // Notificar al padre
            if (onSelectionChange) {
                onSelectionChange(nuevasSelecciones);
            }
            
            return nuevasSelecciones;
        });
    };

    return (
        <div className="search-selector-wrapper">
            <Buscador
                key={reload}
                opciones={opciones}
                placeholder={placeholder}
                keys={keys}
                onChange={handleSelect}
                idField={idField}
                displayField={displayField}
                showId={showId}
            />
            
            {error && <p className="search-selector-error">{error}</p>}

            <div className="search-selector-list-container">
                {selecciones.length === 0 ? (
                    <p className="search-selector-empty-state">No hay elementos seleccionados aún.</p>
                ) : (
                    <ul className="search-selector-list">
                        {selecciones.map((item) => (
                            <li key={item[idField]} className="search-selector-item">
                                <span className="search-selector-name">
                                    {showId ? `${item[idField]} - ` : null}
                                    {typeof displayField === 'function' 
                                        ? displayField(item) 
                                        : item[displayField]}
                                </span>
                                <div className="search-selector-actions">
                                    <button 
                                        className="search-selector-delete-btn" 
                                        onClick={() => handleRemove(item[idField])}
                                        title="Eliminar selección"
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
    );
}