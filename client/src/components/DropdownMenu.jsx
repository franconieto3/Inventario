
import React, { useEffect, useRef } from 'react';

export const DropdownMenu = ({ 
    isOpen, 
    onToggle, 
    items = [] 
}) => {

    const menuRef = useRef(null);

    useEffect(() => {
        // Función que se ejecuta en cada clic
        const handleClickOutside = (event) => {
            // Si el menú está abierto, la referencia existe, 
            // y el elemento clickeado NO está dentro del menú:
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                onToggle(); // Cerramos el menú
            }
        };

        // Activamos el listener solo si el menú está abierto para ahorrar recursos
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Limpieza: quitamos el listener cuando el componente se desmonta o el menú se cierra
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onToggle]);

    
    // Si no está abierto, retornamos solo el botón o null según tu lógica de estructura
    // Aquí mantengo tu estructura original
    return (
        <div className="menu-container" ref={menuRef}>
            <i 
                className={`material-icons version-options-btn ${isOpen ? 'active' : ''}`}
                onClick={onToggle}
            >
                more_vert
            </i>

            {isOpen && (
                <div className="dropdown-menu" >
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
                                    onToggle(e);
                                }}
                                style={{ color: item.color || 'inherit'}}
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