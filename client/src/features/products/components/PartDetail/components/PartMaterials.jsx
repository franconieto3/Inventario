import { useState } from "react";
import { DropdownMenu } from "../../../../../components/ui/DropdownMenu";
import Button from "../../../../../components/ui/Button";
import {Modal} from "../../../../../components/ui/Modal";
import { AgregarMaterial } from "../../../../materiales/components/AgregarMaterial";
import { apiCall } from "../../../../../services/api";
import { EditarBom } from "../../../../materiales/components/EditarBom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartMaterials({pieza,producto, onRefresh}){

    const [activeMenuId, setActiveMenuId] = useState(null);
    const [mostrarAgregar, setMostrarAgregar] = useState(false);

    const [mostrarEditar, setMostrarEditar] = useState(false);
    const [materialSeleccionado, setMaterialSeleccionado] = useState(null);

    const toggleMenu = (id) => setActiveMenuId(activeMenuId === id ? null : id);

    
    const handleRemoveMaterial = async (idBom) => {
        if (!window.confirm("¿Desea quitar este material?")) return;
        try {
            const params = new URLSearchParams({ idBom });
            await apiCall(`${API_URL}/api/materiales/remove?${params.toString()}`, { method: 'DELETE' });
            onRefresh();
        } catch (err) {
            console.error(err.message);
        }
    };

    
    const handleEditMaterial = (componente) => {
        setMaterialSeleccionado(componente);
        setMostrarEditar(true);
    };
    

    return(

        <div className='detalle-documentos'>
            <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className='material-icons'>grid_view</i> Materiales:
            </p>

            {pieza.materiales === undefined || pieza.materiales.length === 0 ? (
                <p className="materials-empty">No se encontraron materiales</p>
            ) : (
                <ul className="materials-list">
                    {pieza.materiales.map((m) => (
                        <li key={`${m.descripcion}`} className="material-item" style={{backgroundColor:'white'}}>
                            <div>
                                <span className="material-nombre">{m.descripcion}</span>
                                <span className="material-cantidad">x{m.consumo_teorico} {m.unidad}.</span>
                            </div>
                            <DropdownMenu
                                isOpen={activeMenuId === m.id_bom}
                                onToggle={() => toggleMenu(m.id_bom)}
                                items={[
                                    { label: 'Modificar cantidad', icon: 'edit', onClick: () => handleEditMaterial(m) },
                                    { label: 'Quitar material', icon: 'remove', color: 'red', onClick: () => handleRemoveMaterial(m.id_bom) }
                                ]}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                <Button variant="secondary" onClick={() => setMostrarAgregar(true)}>Agregar materiales</Button>
            </div>
             
            
            {mostrarAgregar && (
                <Modal 
                    titulo="Agregar material" 
                    descripcion={`${producto.nombre} ${pieza.nombre}`} 
                    onClose={() => setMostrarAgregar(false)}
                >
                    <AgregarMaterial
                        pieza={pieza} 
                        onClose={() => setMostrarAgregar(false)} 
                        onSuccess={onRefresh} 
                    />
                </Modal>
            )}
            
            {mostrarEditar && (
                <Modal
                    titulo="Editar lista de materiales"
                    descripcion={`${producto.nombre} ${pieza.nombre}`}
                    onClose={()=>setMostrarEditar(false)}
                >
                    <EditarBom
                        bom = {materialSeleccionado}
                        onClose={() => { setMostrarEditar(false); setMaterialSeleccionado(null); }}
                        onSuccess={() => { setMaterialSeleccionado(null); onRefresh(); }}
                    />
                </Modal>
            )}
            
        </div>

    );
}