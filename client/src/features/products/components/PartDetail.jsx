import { useEffect, useState, useCallback } from 'react';

import { apiCall } from '../../../services/api';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';
import formatearCodigo from '../../../services/formatearCodigo';
import EdicionPieza from './EdicionPieza';
import { HistorialVersiones } from './HistorialVersiones';
import Can from '../../../components/Can';
import { SolicitudCambio } from './SolicitudCambio';

import "./PartDetail.css"
import { BuscadorPiezas } from './BuscadorPiezas';
import { AgregarComponentes } from '../../ensambles/components/AgregarComponentes';
import Button from '../../../components/ui/Button';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartDetail({ idPieza, nombrePieza, codigoPieza, producto, onRefreshParent }) {

    const [mostrar, setMostrar] = useState(false);
    const [pieza, setPieza] = useState(null);
    const [loading, setLoading] = useState(false);

    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [docSeleccionado, setDocSeleccionado] = useState(null);
    const [menuPiezaOpen, setMenuPiezaOpen] = useState(false);
    const [mostrarEdicion, setMostrarEdicion] = useState(false);
    const [piezaSeleccionada, setPiezaSeleccionada] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [mostrarSolicitud, setMostrarSolicitud] = useState(false);
    const [mostrarAgregarComponente, setMostrarAgregarComponente] = useState(false)

    const fetchPart = useCallback(
        async () => {
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
    , [mostrar, idPieza]);

    useEffect(() => {
        if (mostrar && idPieza) {
            fetchPart();
        }
    }, [fetchPart]);

    const handleVerPlano = async (pathArchivo) => {
        try {
            const params = new URLSearchParams({ path: pathArchivo });

            const {signedUrl} = await apiCall(`${API_URL}/api/documentos/obtener-url-documento?${params.toString()}`,
                {
                    method:'GET',
                });
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
    const handleEliminarVersion = async (idDocumento) => {
        
        if (window.confirm("¿Desea eliminar este documento?")){
            try{

            console.log("Eliminando versión del documento:", idDocumento);
            
            const res = await apiCall(`${API_URL}/api/documentos/eliminar/${idDocumento}`,{'method':'DELETE'});
            fetchPart();
            setActiveMenuId(null);

            }catch(err){
                alert(err.message);
            }
        }
    };

    // Helper para abrir/cerrar menú específico
    const toggleMenu = (id) => {
        if (activeMenuId === id) {
            setActiveMenuId(null); // Si ya está abierto, lo cierra
        } else {
            setActiveMenuId(id); // Si no, lo abre y cierra los demás
        }
    };

    const abrirModalEdicion=(id)=>{
        setPiezaSeleccionada(id)
        setMostrarEdicion(true);
        setMenuPiezaOpen(false);
    }

    const handleEliminarPieza = async (id) => {
        if(window.confirm("¿Seguro que deseas eliminar esta pieza?")) {
            console.log("Eliminando pieza", id);
            try{
                const res = await apiCall(`${API_URL}/api/productos/pieza/eliminacion/${id}`, {method:'DELETE'})
                if (onRefreshParent) onRefreshParent();

            }catch(err){
                alert("Ocurrió un error: ", err.message);
            }
        }
    }

    const handleChangeRequest = (idVersion)=>{
        setMostrarSolicitud(true);
        setDocSeleccionado(idVersion);
    }

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
                        <span>{producto.nombre + " " + nombrePieza + " · Código: " + formatearCodigo(producto.id_rubro, codigoPieza)}</span>
                    </div>
                    <Can permission="administrar_productos">
                        <DropdownMenu
                            isOpen={menuPiezaOpen}
                            onToggle={() => setMenuPiezaOpen(!menuPiezaOpen)}
                            items={[
                                {
                                    label: 'Editar pieza',
                                    icon: 'edit',
                                    onClick: () => abrirModalEdicion(idPieza)
                                },
                                {
                                    label: 'Eliminar pieza',
                                    icon: 'delete',
                                    color: 'red', // Opcional: para indicar peligro
                                    onClick: () => handleEliminarPieza(idPieza)
                                }
                                                        
                            ]}
                        />
                    </Can>

                </div>

                {mostrarEdicion && 
                    <EdicionPieza 
                        idPieza={piezaSeleccionada}
                        producto={producto} 
                        nombreInicial={nombrePieza} 
                        codigoInicial={codigoPieza} 
                        onClose={()=>{
                            setMostrarEdicion(false); 
                            setPiezaSeleccionada(null)}} 
                        onUploadSuccess={()=>{
                            setMostrarEdicion(false); 
                            setPiezaSeleccionada(null);
                            fetchPart();
                            if (onRefreshParent) onRefreshParent();
                        }}
                />}

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
                                                    <DropdownMenu 
                                                        isOpen={activeMenuId === d.id_tipo_documento}
                                                        onToggle={() => toggleMenu(d.id_tipo_documento)}
                                                        items={[
                                                            {
                                                                label:'Solicitar una modificación',
                                                                icon:'edit',
                                                                onClick: ()=> handleChangeRequest(d.id_version)
                                                            },
                                                            {
                                                                label:'Historial de versiones',
                                                                icon: 'history',
                                                                onClick: ()=>verHistorialVersiones(idPieza, d.id_tipo_documento)
                                                            },
                                                            {
                                                                label: 'Eliminar versión',
                                                                icon: 'delete',
                                                                color: 'red', // Opcional: para indicar peligro
                                                                onClick: () => handleEliminarVersion(d.id_version),
                                                                permission:"administrar_documentos"
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
                                    <Button variant="secondary" onClick={()=>{setMostrarAgregarComponente(true)}}>Agregar componentes</Button>
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
                    {mostrarHistorial && 
                        <HistorialVersiones 
                        idPieza={piezaSeleccionada} 
                        idTipoDocumento={docSeleccionado} 
                        closeHistoryModal={()=>{
                            setMostrarHistorial(false); 
                            setDocSeleccionado(null)
                        }} 
                        verDocumento={handleVerPlano}
                        />}  
                    {mostrarSolicitud && 
                        <SolicitudCambio 
                            idVersion={docSeleccionado} 
                            onClose={()=>{
                                setMostrarSolicitud(false); 
                                setDocSeleccionado(null)
                            }}
                    />}
                    {mostrarAgregarComponente &&
                        <AgregarComponentes onClose={()=>{setMostrarAgregarComponente(false)}} idPiezaPadre={pieza.id_pieza}/>
                    }
                    </div>
                )}
                
            </div>
        </>
    );
}