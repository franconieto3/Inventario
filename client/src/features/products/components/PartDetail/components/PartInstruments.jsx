import { useState } from "react";
import { DropdownMenu } from "../../../../../components/ui/DropdownMenu";
import { apiCall } from "../../../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartInstruments({pieza, onRefresh}){

    const [activeMenuId, setActiveMenuId] = useState(null);
    const toggleMenu = (id) => setActiveMenuId(activeMenuId === id ? null : id);

    const HandleRemoveElemento = async (ins)=>{
        if (!window.confirm("¿Desea quitar este elemento de control?")) return;
        try {
            await apiCall(`${API_URL}/api/instrumentos/pieza-instrumento/${pieza.id_pieza}/${ins.id_categoria}`, { method: 'DELETE' });
            onRefresh();
        } catch (err) {
            console.error(err.message);
        }
    }

    return(
        <>
            <div className='detalle-documentos'>
                <p style={{'display':'flex', 'alignItems':'center','gap':'5px'}}>
                    <i className='material-icons'>straighten</i>    
                    Elementos de control: 
                </p>

                {
                    pieza.instrumentos ===undefined || pieza.instrumentos.length === 0 ? (
                        <p className="componentes-empty">No se encontraron elementos de control y medición</p>
                    ) : (
                        <ul className="componentes-list">
                            {
                                pieza.instrumentos.map(
                                    (ins)=>(
                                        <li key={`${ins.id_categoria}`} className="componente-item" >
                                            <div style={{display:'flex', justifyContent: 'space-between', alignItems:'center', width:'100%'}}>  
                                                <h3 className="componente-nombre">{ins.descripcion} </h3>
                                                <DropdownMenu
                                                    isOpen={activeMenuId === ins.id_categoria}
                                                    onToggle={() => toggleMenu(ins.id_categoria)}
                                                    items={[
                                                        { label: 'Quitar elemento', icon: 'delete', color: 'red', onClick: () => HandleRemoveElemento(ins) }
                                                    ]}
                                                />
                                            </div>
                                        </li>
                                    )
                                )
                            }
                        </ul>
                    )
                }
            </div>
        </>
    );
}