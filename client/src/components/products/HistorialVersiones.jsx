import { useEffect, useState } from "react";
import { apiCall } from '../../services/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function HistorialVersiones( {idPieza, idTipoDocumento, closeHistoryModal, verDocumento} ){

    const [versiones, setVersiones]= useState([]);
    
    useEffect(()=>{
        const fetchVersiones = async()=>{
            try{
                const url = `${API_URL}/api/documentos/historial-versiones-pieza?idPieza=${idPieza}&idTipoDocumento=${idTipoDocumento}`;
                const data = await apiCall(url, {method: 'GET'});
                setVersiones(data);
            }catch(err){
                console.log(err.message);
            }
        }
        fetchVersiones();
    },[idPieza, idTipoDocumento]);

    const handleVerPlano = async (pathArchivo) => {
        try {
            const {signedUrl} = await apiCall(`${API_URL}/api/documentos/obtener-url-plano`, {method:'POST', body:JSON.stringify({ path: pathArchivo })});
            window.open(signedUrl, '_blank');

        } catch (err) {
            alert(err.message); // O usa un estado setError para mostrarlo bonito
        }
    };

    return(
        <>
            <div className="overlay">
                <div className="modal">
                    <div className="historial-container">
                        <h4>Historial de Versiones</h4>
                        {versiones.length > 0 ? (
                            versiones.map((v) => (
                                <div key={v.id_version} style={{ borderBottom: '1px solid #ccc','padding':'15px' , 'width':'100%', 'display':'flex','justifyContent': 'space-between', 'alignItems':'center','gap':'15px', 'borderRadius':'10px','cursor': 'pointer'}} onClick={()=>verDocumento(v.path)}>
                                    <div>
                                        <i className="material-icons">open_in_new</i>
                                    </div>
                                    <div>
                                        <p style={{'margin':'0'}}><strong>Fecha:</strong> {new Date(v.fecha_vigencia).toISOString().split("T")[0]}</p>
                                        <p style={{'margin':'0'}}><strong>Descripción:</strong> {v.commit}</p>
                                    </div>
                                    <div>
                                        <i className="material-icons">more_vert</i>
                                    </div>
                                    {/*<p><strong>Path:</strong> {v.path}</p>*/}
                                </div>
                            ))
                        ) : (
                            <p>No se recuperaron versiones anteriores.</p>
                        )}
                    </div>
                    <div>
                        <button onClick={closeHistoryModal}>Cerrar</button>
                    </div>
                </div>
            </div>
        </>
    );
}