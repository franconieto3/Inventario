import { useState } from "react";
import Button from "../../../../../components/ui/Button";

export function PartProcessRoutes({pieza}){
    
    return(
    <>
        <div className='detalle-documentos'>
            <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className='material-icons'>factory</i> Procesos:
            </p>
            
            {pieza.procesos===undefined || pieza.procesos.length === 0 ? (
                <p className="componentes-empty">No se encontraron procesos</p>
            ) : (
                <ul className="componentes-list">
                    {pieza.procesos.map((p) => (
                        <li key={`${p.id_proceso}`} className="componente-item">
                            <div>
                                <span className="componente-nombre">{p.nombre}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </>
);
}