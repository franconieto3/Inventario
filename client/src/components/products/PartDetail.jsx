import { useEffect, useState } from 'react';
import "../../styles/ProductDetail.css"
import { apiCall } from '../../services/api';
import "../../styles/PartDetail.css"
import { HistorialVersiones } from './HistorialVersiones';
import { DropdownMenu } from '../DropdownMenu';
import formatearCodigo from '../../services/formatearCodigo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartDetail({ nombreProducto, idPieza, nombrePieza, rubro, codigoPieza }) {

    const [mostrar, setMostrar] = useState(false);
    const [pieza, setPieza] = useState(null);
    const [loading, setLoading] = useState(false);

    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [docSeleccionado, setDocSeleccionado] = useState(null);
    const [piezaSeleccionada, setPiezaSeleccionada] = useState(null);

    // 2. Estado para controlar qué menú desplegable está abierto (por ID de documento)
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        const fetchPart = async () => {
            setLoading(true);
            try {
                const data = await apiCall(`${API_URL}/api/productos/pieza/${idPieza}`,{});
                setPieza(data);
            } catch (err) {
                console.error(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (mostrar && idPieza) {
            fetchPart();
        }
    }, [mostrar, idPieza]);

    const handleVerPlano = async (pathArchivo) => {
        try {
            const {signedUrl} = await apiCall(`${API_URL}/api/documentos/obtener-url-plano`, {method:'POST', body:JSON.stringify({ path: pathArchivo })});
            window.open(signedUrl, '_blank');

        } catch (err) {
            alert(err.message); // O usa un estado setError para mostrarlo bonito
        }
    };

    const verHistorialVersiones = async (idPieza, idTipoDocumento) =>{
        setPiezaSeleccionada(idPieza);
        setDocSeleccionado(idTipoDocumento);
        setMostrarHistorial(true);
    }

    // 3. Función vacía para la acción del menú
    const handleEliminarVersion = (idDocumento) => {
        console.log("Eliminando versión del documento:", idDocumento);
        // Lógica futura aquí...
    };

    // Helper para abrir/cerrar menú específico
    const toggleMenu = (id) => {
        if (activeMenuId === id) {
            setActiveMenuId(null); // Si ya está abierto, lo cierra
        } else {
            setActiveMenuId(id); // Si no, lo abre y cierra los demás
        }
    };

    return (
        <>
            <div className='detail'>
                <div style={{'display':'flex', 'justifyContent':'space-between', 'alignItems':'center'}}>
                    <div className='part-title'>
                        <input 
                            type='checkbox' 
                            name="Piezas" 
                            onChange={() => setMostrar(!mostrar)} 
                            checked={mostrar} 
                        />
                        <span>{nombreProducto + " " + nombrePieza + " · Código: " + formatearCodigo(rubro, codigoPieza)}</span>
                    </div>
                    <i className='material-icons' style={{'fontSize':'1.2rem', 'cursor':'pointer'}}>edit</i>
                </div>
                {mostrar && (
                    <div className="pieza-info">
                        {loading && <p>Cargando...</p>}
                        
                        {!loading && pieza && (
                            <div style={{'display':'flex', 'gap':'15px', 'flexWrap':'wrap'}}>
                                <div className='detalle-documentos' style={pieza.documentos?{'display':'block'}:{'display':'none'}}>
                                    <p style={{'display':'flex', 'alignItems':'center','gap':'5px'}}>
                                        <i className='material-icons'>file_open</i>    
                                        Documentos: 
                                    </p>
                                    <div className=''>
                                        {pieza.documentos.map((d)=>(
                                            <div key={d.id_tipo_documento} className='display-documento'>
                                                <div style={{'cursor':'pointer'}} onClick={() => handleVerPlano(d.path)} >
                                                    <i className='material-icons'>open_in_new</i>
                                                    <a                         
                                                    style={{
                                                    color: 'blue', 
                                                    textDecoration: 'underline'
                                                    }}>
                                                        Ver {d.descripcion}
                                                    </a>
                                                </div>
                                                <div>
                                                    <span className='material-icons' style={{'cursor':'pointer'}} onClick={() => verHistorialVersiones(idPieza, d.id_tipo_documento)}>history</span>
                                                    {/* 4. Implementación del DropdownMenu */}
                                                    <DropdownMenu 
                                                        isOpen={activeMenuId === d.id_tipo_documento}
                                                        onToggle={() => toggleMenu(d.id_tipo_documento)}
                                                        items={[
                                                            {
                                                                label: 'Eliminar versión',
                                                                icon: 'delete',
                                                                color: 'red', // Opcional: para indicar peligro
                                                                onClick: () => handleEliminarVersion(d.id_version)
                                                            }
                                                        ]}
                                                    />
                                                </div>
                                            </div>
                                            )) 
                                        }
                                    </div>
                                </div> 

                                <div className='detalle-documentos'>
                                    <p style={{'display':'flex', 'alignItems':'center','gap':'5px'}}>
                                        <i className='material-icons'>grid_view</i>    
                                        Componentes: 
                                    </p>
                                </div>

                                <div className='detalle-documentos'>
                                    <p style={{'display':'flex', 'alignItems':'center','gap':'5px'}}>
                                        <i className='material-icons'>list</i>    
                                        Materiales: 
                                    </p>
                                </div>

                                <div className='detalle-documentos'>
                                    <p style={{'display':'flex', 'alignItems':'center','gap':'5px'}}>
                                        <i className='material-icons'>factory</i>    
                                        Procesos: 
                                    </p>
                                </div>

                                <div className='detalle-documentos'>
                                    <p style={{'display':'flex', 'alignItems':'center','gap':'5px'}}>
                                        <i className='material-icons'>straighten</i>    
                                        Elementos de control: 
                                    </p>
                                </div>
                                
                            </div>
                        )}
                    {mostrarHistorial && <HistorialVersiones idPieza={piezaSeleccionada} idTipoDocumento={docSeleccionado} closeHistoryModal={()=>setMostrarHistorial(false)} verDocumento={handleVerPlano}/>}  
                    </div>
                )}
            </div>
        </>
    );
}