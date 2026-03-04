import { useState } from "react";
import { DropdownMenu } from "../../../../../components/ui/DropdownMenu";
import Button from "../../../../../components/ui/Button";


export function PartMaterials({pieza, onRefresh}){

    const [activeMenuId, setActiveMenuId] = useState(null);
    const [mostrarAgregar, setMostrarAgregar] = useState(false);

    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
    return(

        <div className='detalle-documentos'>
            <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className='material-icons'>grid_view</i> Materiales:
            </p>

            {pieza.materiales === undefined || pieza.materiales.length === 0 ? (
                <p className="materials-empty">No se encontraron materiales</p>
            ) : (
                <ul className="materiales-list">
                    {pieza.materiales.map((m) => (
                        <li key={`${m.descripcion}`} className="material-item">
                            <div>
                                <span className="material-nombre">{m.descripcion}</span>
                                <span className="material-cantidad">x{m.cantidad_teorica}</span>
                            </div>
                            <DropdownMenu
                                isOpen={activeMenuId === m.id_material}
                                onToggle={() => toggleMenu(m.id_material)}
                                items={[
                                    { label: 'Modificar cantidad', icon: 'edit', onClick: () => handleEditMaterial(m) },
                                    { label: 'Quitar material', icon: 'remove', onClick: () => handleRemoveMaterial(m.id_material) }
                                ]}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Button variant="secondary" onClick={() => setMostrarAgregar(true)}>Agregar materiales</Button>
            </div>
             
            
            {mostrarAgregar && (
                <AgregarMateriales
                    pieza={pieza} 
                    onClose={() => setMostrarAgregar(false)} 
                    onSuccess={onRefresh} 
                />
            )}
            
            {mostrarEditar && (
                <EditarMaterial
                    idPiezaPadre={pieza.id_pieza}
                    material={materialSeleccionado}
                    onClose={() => { setMostrarEditar(false); setMaterialSeleccionado(null); }}
                    onSuccess={() => { setMaterialSeleccionado(null); onRefresh(); }}
                />
            )}
            
        </div>

    );
}