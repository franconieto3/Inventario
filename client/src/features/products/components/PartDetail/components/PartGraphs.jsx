import { useProcessGraphs } from "../../../../procesos/hooks/useProcessGraphs";
import { DropdownMenu } from "../../../../../components/ui/DropdownMenu";
import Button from "../../../../../components/ui/Button";
import { apiCall } from "../../../../../services/api";
import { Modal } from "../../../../../components/ui/Modal";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartGraphs({pieza, onRouteRemoval}){
    
    const navigate = useNavigate();
    const {tipos} = useProcessGraphs();

    const [activeMenuId, setActiveMenuId] = useState(null);
    const toggleMenu = (id) => setActiveMenuId(activeMenuId === id ? null : id);

    const [tiposFiltrados, setTiposFiltrados] = useState([]);

    const [activeHistoryMenuId, setActiveHistoryMenuId] = useState(null);
    const toggleHistoryMenu = (id) => setActiveHistoryMenuId(activeHistoryMenuId === id ? null : id);

    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

    useEffect(() => { 
        if (!pieza?.procesos || !tipos) return;
        const descripcionesDeProcesos = new Set(pieza.procesos.map(r => r.descripcion));
        const filtrado = tipos.filter(t => descripcionesDeProcesos.has(t.descripcion));
        setTiposFiltrados(filtrado);
    }, [pieza, tipos]);

    /*Filtrado de rutas más recientes por tipo de ruta */
    const rutasMasRecientes = useMemo(() => {
        if (!pieza?.procesos || tiposFiltrados.length === 0) return [];

        return tiposFiltrados.map((t) => {

            const rutas = pieza.procesos.filter((r) => r.id_tipo_ruta === t.id_tipo_ruta);
            
            const rutaMasReciente = rutas.reduce((max, r) => {
                return new Date(r.fecha_vigencia) > new Date(max.fecha_vigencia) ? r : max;
            });

            return {
                tipo: t,
                ruta: rutaMasReciente
            };
        });
    }, [pieza, tiposFiltrados]);

    /* Historial de rutas */
    const handleRouteHistory = (tipo)=>{
        setMostrarHistorial(true);
        setTipoSeleccionado(tipo);
    }

    /*Desvinculación de rutas y piezas*/
    const handleRemoveRouteFromPart = async (idRuta)=>{
        if (window.confirm("¿Desea quitar esta ruta?")){
            try{
                const res = await apiCall(`${API_URL}/api/procesos/ruta/desvinculacion/${idRuta}/${pieza.id_pieza}`,{method: 'DELETE'});
                if (onRouteRemoval) onRouteRemoval();
            }catch(err){
                console.log(err.message);
            }
        }
    }

    return (
        <>
            <div className='detalle-documentos'>
                <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className='material-icons'>factory</i> Procesos:
                </p>
            
                {pieza.procesos===undefined || pieza.procesos.length === 0 ? 
                    (<p className="componentes-empty">No se encontraron procesos</p>) : 
                    (<>
                        {/* Listado de rutas segun el tipo (fabricación, loteo, etc) */}
                        <ul className="componentes-list">
                            {rutasMasRecientes.map(({ tipo, ruta }) => (
                                <li
                                    key={`${tipo.id_tipo_ruta}`} 
                                    className="componente-item"                               
                                >
                                    <div style={{display:'flex', justifyContent: 'space-between', alignItems:'center', width:'100%'}}>
                                        <div
                                            onClick={() => navigate(`/flujograma/${ruta.id_ruta}`)}
                                        >
                                            <h3 className="componente-nombre">{tipo.descripcion}: </h3>
                                            <span 
                                                style={{
                                                    fontSize:'0.875rem',
                                                    color:'#64748b',
                                                    fontWeight:'400'
                                                }}
                                            >
                                                {ruta.nombre}
                                            </span>
                                        </div>
                                        <DropdownMenu
                                            isOpen={activeMenuId === ruta.id_ruta}
                                            onToggle={() => toggleMenu(ruta.id_ruta)}
                                            items={[{ 
                                                label: 'Ver historial',
                                                icon: 'history',
                                                onClick: () => handleRouteHistory(tipo) 
                                            },{
                                                label: 'Desvincular ruta',
                                                icon: 'delete',
                                                color: 'red',
                                                onClick: () => handleRemoveRouteFromPart(ruta.id_ruta)
                                            }]}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>)
                }
            </div>

            {mostrarHistorial &&
                <Modal
                    titulo="Historial de rutas de procesos"
                    descripcion={tipoSeleccionado.descripcion}
                    onClose={()=>setMostrarHistorial(false)} 
                >
                    <ul className="componentes-list" style={{marginTop:'0px', paddingTop:'0px'}}>
                        {
                            pieza
                            .procesos
                            .filter((r)=> r.id_tipo_ruta === tipoSeleccionado.id_tipo_ruta)
                            .sort((a,b)=> new Date(b.fecha_vigencia) - new Date(a.fecha_vigencia))
                            .map(
                                (ruta)=>(
                                <li
                                    key={`${ruta.id_ruta}`} 
                                    className="componente-item"
                                >
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', width:'100%'}}>
                                        <div style={{width:'100%'}}
                                        onClick={() => {
                                            setMostrarHistorial(false);
                                            verRuta(ruta.id_ruta)
                                        }}>
                                            <p 
                                                style={{
                                                    fontSize:'1rem',
                                                    margin:'0',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {ruta.nombre}
                                            </p>
                                            <p style={{'margin':'0'}}>Fecha: {new Date(ruta.fecha_vigencia).toISOString().split("T")[0]}</p>
                                        </div>
                                        <DropdownMenu
                                            isOpen={activeHistoryMenuId === ruta.id_ruta}
                                            onToggle={() => toggleHistoryMenu(ruta.id_ruta)}
                                            items={[
                                                { 
                                                    label: 'Desvincular ruta',
                                                    icon: 'delete',
                                                    color: 'red',
                                                    onClick: () => {
                                                        setMostrarHistorial(false);
                                                        handleRemoveRouteFromPart(ruta.id_ruta);
                                                }}
                                            ]}
                                        />
                                    </div>
                                </li>
                            ))
                        }
                    </ul>
                </Modal>
            }
        </>
    );
}