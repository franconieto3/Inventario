import React from 'react';

export const DropdownMenu = ({ 
    isOpen, 
    onToggle, 
    items = [] // Array de objetos: { label, icon, onClick, color, separator }
}) => {
    
    // Si no está abierto, retornamos solo el botón o null según tu lógica de estructura
    // Aquí mantengo tu estructura original
    return (
        <div className="menu-container">
            <i 
                className={`material-icons version-options-btn ${isOpen ? 'active' : ''}`}
                onClick={onToggle}
            >
                more_vert
            </i>

            {isOpen && (
                <div className="dropdown-menu">
                    {items.map((item, index) => {
                        
                        // Si es un separador
                        if (item.separator) {
                            return <div key={index} className="menu-separator"></div>;
                        }

                        // Opción normal
                        return (
                            <div 
                                key={index} 
                                className="dropdown-item" 
                                onClick={(e) => {
                                    e.stopPropagation(); // Evitar burbujeo
                                    item.onClick();
                                    // Opcional: onToggle(e); // Cerrar menú automáticamente tras click
                                }}
                                style={{ color: item.color || 'inherit' }}
                            >
                                {item.icon && (
                                    <i 
                                        className="material-icons" 
                                        style={{ color: item.color || 'inherit' }}
                                    >
                                        {item.icon}
                                    </i>
                                )}
                                <span>{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};