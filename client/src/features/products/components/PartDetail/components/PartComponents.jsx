import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../../../services/api";
import { DropdownMenu } from "../../../../../components/ui/DropdownMenu";
import Button from "../../../../../components/ui/Button";
import { AgregarComponentes } from "../../../../ensambles/components/AgregarComponentes";
import { EditarComponente } from "../../../../ensambles/components/EditarComponentes";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartComponents({ pieza, producto, onRefresh }) {
    const navigate = useNavigate();
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [mostrarAgregar, setMostrarAgregar] = useState(false);
    
    // Estados aislados para la edición de cantidad
    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [componenteSeleccionado, setComponenteSeleccionado] = useState(null);

    const toggleMenu = (id) => setActiveMenuId(activeMenuId === id ? null : id);

    const handleRemoveComponent = async (idComponente) => {
        if (!window.confirm("¿Desea quitar este componente?")) return;
        try {
            const params = new URLSearchParams({ idPiezaPadre: pieza.id_pieza, idPiezaHijo: idComponente });
            await apiCall(`${API_URL}/api/componentes/remove?${params.toString()}`, { method: 'DELETE' });
            onRefresh();
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleEditComponent = (componente) => {
        setComponenteSeleccionado(componente);
        setMostrarEditar(true);
    };

    return (
        <div className='detalle-documentos'>
            <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className='material-icons'>grid_view</i> Componentes:
            </p>

            {pieza.componentes.length === 0 ? (
                <p className="componentes-empty">No se encontraron componentes</p>
            ) : (
                <ul className="componentes-list">
                    {pieza.componentes.map((c) => (
                        <li key={`${c.id_producto}-${c.id_pieza}`} className="componente-item">
                            <div onClick={() => navigate(`/producto/${c.id_producto}`)}>
                                <span className="componente-nombre">{c.nombre_producto} {c.nombre_pieza}</span>
                                <span className="componente-cantidad">x{c.cantidad}</span>
                            </div>
                            <DropdownMenu
                                isOpen={activeMenuId === c.id_pieza}
                                onToggle={() => toggleMenu(c.id_pieza)}
                                items={[
                                    { label: 'Modificar cantidad', icon: 'edit', onClick: () => handleEditComponent(c) },
                                    { label: 'Quitar componente', icon: 'remove', onClick: () => handleRemoveComponent(c.id_pieza) }
                                ]}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Button variant="secondary" onClick={() => setMostrarAgregar(true)}>Agregar componentes</Button>
            </div>

            {/* Modales aislados de la vista principal */}
            {mostrarAgregar && (
                <AgregarComponentes 
                    idPiezaPadre={pieza.id_pieza} 
                    nombrePiezaPadre={`${producto.nombre} ${pieza.nombre}`}
                    onClose={() => setMostrarAgregar(false)} 
                    onSuccess={onRefresh} 
                />
            )}
            
            {mostrarEditar && (
                <EditarComponente
                    idPiezaPadre={pieza.id_pieza}
                    componente={componenteSeleccionado}
                    nombrePiezaPadre={`${producto.nombre} ${pieza.nombre}`}
                    onClose={() => { setMostrarEditar(false); setComponenteSeleccionado(null); }}
                    onSuccess={() => { setComponenteSeleccionado(null); onRefresh(); }}
                />
            )}
        </div>
    );
}