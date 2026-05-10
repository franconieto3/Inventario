import { useState } from "react";
import Button from "./Button";
import "./ToggleSelector.css"

export function ToggleSelector({
    titulo, 
    items, 
    idField, 
    displayField,
    selectedItems = [],
    onChangeSelection
}){

    const todasSeleccionadas = items.length > 0 && selectedItems.length === items.length;

    const handleToggle= (id) => {
        onChangeSelection(prev => 
            prev.includes(id) 
                ? prev.filter(piezaId => piezaId !== id)
                : [...prev, id]
        )
    }

    const handleSeleccionarTodo = () => {
        if (todasSeleccionadas) {
            onChangeSelection([]);
        } else {
            const todosLosIds = items.map(p => p[idField]);
            onChangeSelection(todosLosIds); 
        }
    };

    return(
        <>
            <div className="piezas-section">
                <div className="piezas-header">
                    <h3 className="modal-title" style={{ textAlign: 'start', margin: 0 }}>
                        {titulo}
                    </h3>
                    <Button 
                        variant="secondary" 
                        onClick={handleSeleccionarTodo}
                        disabled={!items || items.length === 0} 
                    >
                        {todasSeleccionadas ? "Deseleccionar todo" : "Seleccionar todo"}
                    </Button>
                </div>


                <div className="piezas-lista">
                    {items && items.map((p) => {
                        const isChecked = selectedItems.includes(p[idField]);
                        return (
                            <label 
                                key={p[idField]} 
                                className={`pieza-item ${isChecked ? 'selected' : ''}`}
                            >
                                <div className="checkbox-container">
                                    <input 
                                        type="checkbox" 
                                        checked={isChecked}
                                        onChange={() => handleToggle(p[idField])}
                                    />
                                    <span className="pieza-nombre">
                                        {displayField(p)}
                                    </span>
                                </div>
                            </label>
                        );
                    })}
                    
                    {(!items || items.length === 0) && (
                        <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '10px' }}>
                            No se encontraron items para seleccionar.
                        </p>
                    )}
                </div>
            </div>
        </>
    );

}