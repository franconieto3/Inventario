import { useEffect, useState, useRef } from "react";
import { apiCall } from '../../services/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
import "../../styles/HistorialVersiones.css";

export function HistorialVersiones( {idPieza, idTipoDocumento, closeHistoryModal, verDocumento} ){

    const [versiones, setVersiones]= useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null); 
    const menuRef = useRef(null); // Referencia para detectar clics fuera
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    
    useEffect(()=>{
        const fetchVersiones = async()=>{
            try{
                setLoading(true);
                const url = `${API_URL}/api/documentos/historial-versiones-pieza?idPieza=${idPieza}&idTipoDocumento=${idTipoDocumento}`;
                const data = await apiCall(url, {method: 'GET'});
                setVersiones(data);
            }catch(err){
                console.log(err.message);
                setError(true);
            }finally{
                setLoading(false);
            }
        }
        fetchVersiones();
    },[idPieza, idTipoDocumento]);

    // Lógica para cerrar el menú si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleMenu = (e, idVersion) => {
        e.stopPropagation(); // Evita que el evento llegue al document y cierre el menú inmediatamente
        if (activeMenuId === idVersion) {
            setActiveMenuId(null); // Si ya está abierto, lo cierra
        } else {
            setActiveMenuId(idVersion); // Abre el de esta fila
        }
    };

    // Funciones placeholders para las acciones
    const handleReestablecer = async (v) => {
        if(confirm(`¿Deseas reestablecer la versión del ${new Date(version.fecha_vigencia).toISOString().split("T")[0]}?`)){
            console.log("Reestableciendo versión:", version.id_version);
            setActiveMenuId(null);
            // Aquí tu lógica de API call
            /*
            const payload = {
            
            documento:{
                id_producto: producto.id_producto
            },
            version:{
                fecha_vigencia: v.fecha_vigencia,
                commit: v.commit,
                path: v.path,
                id_tipo_documento: v.id_tipo_documento
            },
            piezas:piezasPlano
            };
            console.log(payload);
            
            //3. Enviar los datos del plano al backend
            const respuesta = await apiCall(`${API_URL}/api/documentos/guardar-documento`, {method: 'POST', body: JSON.stringify(payload)});
            
            alert("Plano subido y asociado correctamente.");
            setAgregarPlanos(false);*/

        }
    };

    const handleEliminar = (version) => {
        if(confirm("¿Estás seguro de eliminar esta versión del historial?")){
            console.log("Eliminando versión:", version.id_version);
            setActiveMenuId(null);
            // Aquí tu lógica de API call
        }
    };

    return(
        <>
            <div className="overlay">
                <div className="modal">
                    <div className="historial-container">
                        <h4>Historial de Versiones</h4>
                        {loading && (
                        <div style={{"display":"flex","justifyContent":"center","alignItems": "center","width":"100%", "marginTop":"30px"}}>  
                            <p>Cargando...</p>
                        </div>)}
                        {versiones.length > 0 &&
                            versiones.map((v) => (
                                <div 
                                    key={v.id_version} 
                                    style={{ borderBottom: '1px solid #ccc','padding':'15px' , 'width':'100%', 'display':'flex','justifyContent': 'space-between', 'alignItems':'center', 'borderRadius':'10px','gap':'15px'}} >
                                    <div 
                                        style={{'display':'flex','justifyContent': 'space-between', 'alignItems':'center','gap':'15px','cursor': 'pointer'}}
                                        onClick={()=>verDocumento(v.path)}
                                    >
                                        <div>
                                            <i className="material-icons" >open_in_new</i>
                                        </div>
                                        <div>
                                            <p style={{'margin':'0'}}><strong>Fecha:</strong> {new Date(v.fecha_vigencia).toISOString().split("T")[0]}</p>
                                            <p style={{'margin':'0'}}><strong>Descripción:</strong> {v.commit}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="menu-container">
                                        <i 
                                            className={`material-icons version-options-btn ${activeMenuId === v.id_version ? 'active' : ''}`}
                                            onClick={(e) => toggleMenu(e, v.id_version)}
                                        >
                                            more_vert
                                        </i>

                                        {/* Renderizado condicional del menú solo para la fila activa */}
                                        {activeMenuId === v.id_version && (
                                            <div className="dropdown-menu">
                                                <div className="dropdown-item" onClick={() => handleReestablecer(v)}>
                                                    <i className="material-icons">restore</i>
                                                    <span>Restablecer esta versión</span>
                                                </div>
                                                
                                                <div className="menu-separator"></div>

                                                <div className="dropdown-item" style={{"color":"red"}} onClick={() => handleEliminar(v)}>
                                                    <i className="material-icons" style={{"color":"red"}}>delete</i>
                                                    <span>Eliminar versión</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        }
                        {error && <p>Ocurrió un error. No se recuperaron versiones anteriores.</p>}
                    </div>
                    <div>
                        <button onClick={closeHistoryModal}>Cerrar</button>
                    </div>
                </div>
            </div>
        </>
    );
}