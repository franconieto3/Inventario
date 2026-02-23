import {useEffect, useState} from 'react';
import { UserAuth } from '../../auth/context/AuthContext';

import './SolicitudCambio.css'
import { apiCall } from '../../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function SolicitudCambio({idVersion, onClose}){

	const [mensaje, setMensaje] = useState("");
	const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
	
    const {user} = UserAuth();

	const handleSubmit = async(e)=>{
		e.preventDefault();
		try{
            setError(null);
            setLoading(true);

            const url = `${API_URL}/api/documentos/nueva-solicitud`;
            const data = await apiCall(url,
                 {
                    method: 'POST', 
                    body:JSON.stringify({
                        idUsuario: user.id_usuario,
                        mensaje: mensaje,
                        idVersion: idVersion
                    })
                });

            onClose();

        }catch(err){
            console.error(err);
            setError(err.message);
        }finally{
            setLoading(false);
        }		
	}
	
	return(
		<>
			<div className="overlay">
				<div className="modal">
                    <div style={{'display':'flex', "gap":"8px"}}>
                        <div style={{'display':'flex', "gap":"8px"}}>
                            <i className='material-icons' id='close-button' onClick={onClose}>close</i>
                        </div>
                        <div style={{'width':'100%'}}>
                            <h3 style={{
                                "fontSize":"1rem", 
                                "textAlign":'start',
                                'paddingTop':'10px', 
                                'paddingBottom':'10px'
                                }}>
                                Solicitar cambio de versión
                            </h3>
                            <form onSubmit={(e)=>handleSubmit(e)}>
                                <div className='input-mensaje'>
                                    <div style={{ 'width': '100%', 'textAlign': 'start','marginBottom':'10px' }}>Observaciones:</div>
                                    <textarea 
                                        style={{'width':'100%', 'height':'150px'}}
                                        type="text"
                                        placeholder="Describa el cambio a solicitar"
                                        value={mensaje}
                                        onChange={(e)=>setMensaje(e.target.value)}
                                    />
                                </div>
                                <div style={{ 'textAlign': 'start', 'paddingTop': '10px', 'paddingBottom': '10px' }}>
                                    <button 
                                        style={{ 'backgroundColor': '#033545', 'color': 'white', 'borderRadius': '8px' }} 
                                    type="submit" 
                                    disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : 'Guardar cambios'}
                                    </button>
                                </div>
                                {error && <span style={{'color':'red'}}>{error}</span>}
                            </form>
                        </div>
                    </div>
                    
				</div>
			</div>
		</>	
	);
}