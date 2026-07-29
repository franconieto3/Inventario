import React from 'react';

export const Arista = ({ edge, sourceNode, targetNode, onPriorityChange, onDelete, isReadOnly=false }) => {
    if (!sourceNode || !targetNode) return null;

    // Asumimos que la conexión sale por la derecha del origen y entra por la izquierda del destino
    const x1 = sourceNode.x + 170; // Ancho aproximado del nodo
    const y1 = sourceNode.y + 20;  // Centro aproximado en Y
    const x2 = targetNode.x;
    const y2 = targetNode.y + 20;

    // Curva de Bézier para suavizar la conexión ante el movimiento libre en cualquier eje
    const midX = x1 + (x2 - x1) / 2;
    const pathData = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

    // Coordenadas para el input de prioridad en el centro exacto de la curva
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    return (
        <g>
            <path 
                d={pathData} 
                stroke="#64748b" 
                strokeWidth="2" 
                fill="none" 
                markerEnd="url(#arrowhead)" 
            />
            <foreignObject 
                x={centerX - 40} 
                y={centerY - 15} 
                width="80" 
                height="30"
                style={{ pointerEvents: 'auto' }} 
            >
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', background: '#fff', padding: '2px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    {isReadOnly ? 
                        (<span>{edge.prioridad}</span>):
                        (<input 
                            type="number"
                            min="1"
                            value={edge.prioridad || 1}
                            onChange={(e) => onPriorityChange(edge.id_nodo_origen, edge.id_nodo_destino, e.target.value)}
                            title="Prioridad"
                            style={{
                                width: '40px',
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                border: 'none',
                                outline: 'none',
                            }}
                        />
                        )
                    }
                    {!isReadOnly && (
                        <button 
                            onClick={() => onDelete(edge.id_nodo_origen, edge.id_nodo_destino)}
                            style={{
                                background: '#fee2e2',
                                color: '#ef4444',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2px'
                            }}
                            title="Eliminar arista"
                        >
                            <i className="material-icons" style={{ fontSize: '14px' }}>close</i>
                        </button>
                    )}
                </div>
            </foreignObject>
        </g>
    );
};