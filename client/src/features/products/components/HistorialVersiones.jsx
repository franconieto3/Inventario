import { useEffect, useState, useCallback} from "react";

import { apiCall } from "../../../services/api";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";

import "./HistorialVersiones.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function HistorialVersiones( {idPieza, idTipoDocumento, closeHistoryModal, verDocumento} ){

    const [versiones, setVersiones]= useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    
    const fetchVersiones = useCallback(async()=>{
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
    },[idPieza, idTipoDocumento])

    useEffect(()=>{
        fetchVersiones();
    },[fetchVersiones]); 

    const toggleMenu = (idVersion) => {
        if (activeMenuId === idVersion) {
            setActiveMenuId(null); // Si ya está abierto, lo cierra
        } else {
            setActiveMenuId(idVersion); // Abre el de esta fila
        }
    };

    // Funciones placeholders para las acciones
    const handleReestablecer = async (v) => {
        if(confirm(`¿Deseas reestablecer la versión del ${new Date(v.fecha_vigencia).toISOString().split("T")[0]}?`)){
            setActiveMenuId(null);
            // Aquí tu lógica de API call
            try{
                const payload = {
                    idVersionRecuperada: v.id_version,
                    fecha_vigencia: v.fecha_vigencia,
                    commit: v.commit,
                    path: v.path,
                    id_tipo_documento: v.id_tipo_documento
                };
                
                //3. Enviar los datos del plano al backend
                const respuesta = await apiCall(`${API_URL}/api/documentos/recuperar-version`, {method: 'POST', body: JSON.stringify(payload)});
                
                //alert("Plano subido y asociado correctamente.");
                fetchVersiones();
            }catch(err){
                alert(err.message);
            }

        }
    };

    const handleEliminar = async (version) => {
        if(confirm("¿Estás seguro de eliminar esta versión del historial?")){
            console.log("Eliminando versión:", version.id_version);
            setActiveMenuId(null);
            // Aquí tu lógica de API call
            try{
            console.log("Eliminando versión del documento:", version.id_version);
            
            const res = await apiCall(`${API_URL}/api/documentos/eliminar/${version.id_version}`,{'method':'DELETE'});
            
            setVersiones(prevVersiones => prevVersiones.filter(v => v.id_version !== version.id_version));
            
            //alert("Documento eliminado exitosamente");
            

            }catch(err){
                alert(err.message);
            }
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
                            versiones.map((v) => {

                            // Definimos las opciones específicas para ESTE ítem
                            const menuOptions = [
                                { 
                                    label: "Restablecer esta versión", 
                                    icon: "restore", 
                                    onClick: () => handleReestablecer(v) 
                                },
                                { 
                                    separator: true 
                                },
                                { 
                                    label: "Eliminar versión", 
                                    icon: "delete", 
                                    color: "red",
                                    onClick: () => handleEliminar(v) 
                                }
                            ];

                            return (
                                <div key={v.id_version} style={{ borderBottom: '1px solid #ccc','padding':'15px' , 'width':'100%', 'display':'flex','justifyContent': 'space-between', 'alignItems':'center', 'borderRadius':'10px','gap':'15px'}}>
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
                                    
                                    <div>
                                        <DropdownMenu 
                                            isOpen={activeMenuId === v.id_version} 
                                            onToggle={() => toggleMenu(v.id_version)} 
                                            items={menuOptions} // <--- Aquí la magia
                                        />
                                    </div>
                                </div>
                            );
                        })
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