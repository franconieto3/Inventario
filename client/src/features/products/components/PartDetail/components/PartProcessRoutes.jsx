import { useEffect, useState, useMemo } from "react";
import Button from "../../../../../components/ui/Button";
import { apiCall } from "../../../../../services/api";
import { Modal } from "../../../../../components/ui/Modal";
import { DetalleRuta } from "../../../../procesos/components/DetalleRuta";
import { useProcessRoutes } from "../../../../procesos/hooks/useProcessRoutes";
import { DropdownMenu } from "../../../../../components/ui/DropdownMenu";


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartProcessRoutes({pieza}){

    const {tipos} = useProcessRoutes();
    const [mostrarRuta, setMostrarRuta] = useState(false);
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
    const [tiposFiltrados, setTiposFiltrados] = useState([]);

    const [activeMenuId, setActiveMenuId] = useState(null);
    const toggleMenu = (id) => setActiveMenuId(activeMenuId === id ? null : id);

    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

    useEffect(() => { 
        if (!pieza?.procesos || !tipos) return;
        const descripcionesDeProcesos = new Set(pieza.procesos.map(r => r.descripcion));
        const filtrado = tipos.filter(t => descripcionesDeProcesos.has(t.descripcion));
        setTiposFiltrados(filtrado);
    }, [pieza, tipos]);

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

    const verRuta = async(idBop)=>{
        try{
            const res = await apiCall(`${API_URL}/api/procesos/ruta/${idBop}`);
            setRutaSeleccionada(res);
            setMostrarRuta(true);

        }catch(err){
            console.log(err.message);
            setRutaSeleccionada(null);
            setMostrarRuta(false);
        }
    }

    /* Historial de rutas */
    const handleRouteHistory = (tipo)=>{
        console.log(`Viendo rutas de ${tipo.descripcion}`)
        setMostrarHistorial(true);
        setTipoSeleccionado(tipo);
    }

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
                        {rutasMasRecientes.map(({ tipo, ruta }) => (
                            <li
                                key={`${tipo.id_tipo_ruta}`} 
                                className="componente-item"                               
                            >
                                <div style={{display:'flex', justifyContent: 'space-between', alignItems:'center', width:'100%'}}>
                                    <div
                                        onClick={() => verRuta(ruta.id_bop)}
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
                                        isOpen={activeMenuId === ruta.id_bop}
                                        onToggle={() => toggleMenu(ruta.id_bop)}
                                        items={[
                                            { label: 'Ver historial', icon: 'history', onClick: () => handleRouteHistory(tipo) }
                                        ]}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
            )}
            
        </div>
        {mostrarRuta &&
            <Modal
                titulo= "Ruta de procesos"
                descripcion={rutaSeleccionada.nombre}
                onClose={()=>setMostrarRuta(false)}
            >
                <DetalleRuta
                    ruta={rutaSeleccionada}
                />
            </Modal>
        }
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
                                    key={`${ruta.id_bop}`} 
                                    className="componente-item"
                                    onClick={() => {
                                        setMostrarHistorial(false);
                                        verRuta(ruta.id_bop)
                                    }}
                                >
                                    <div>
                                        <p 
                                            style={{
                                                fontSize:'1rem',
                                                margin:'0',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {ruta.nombre}
                                        </p>
                                        <p style={{'margin':'0'}}>Fecha de vigencia: {new Date(ruta.fecha_vigencia).toISOString().split("T")[0]}</p>
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