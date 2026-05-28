import {useEffect, useState} from 'react';
import { UserAuth } from '../../auth/context/AuthContext';

import './SolicitudCambio.css'
import { apiCall } from '../../../services/api';
import Button from '../../../components/ui/Button';

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
            <div className='modal-content' style={{'width':'100%'}}>
                <form onSubmit={(e)=>handleSubmit(e)}>
                    <div className='input-mensaje'>
                        <div style={{ 'width': '100%', 'textAlign': 'start','marginBottom':'10px', fontSize:'1rem', fontWeight:'500'}}>Observaciones:</div>
                        <textarea 
                            style={{'width':'100%', 'height':'150px'}}
                            type="text"
                            placeholder="Describa el cambio a solicitar"
                            value={mensaje}
                            onChange={(e)=>setMensaje(e.target.value)}
                        />
                    </div>
                    <Button variant='default' type='submit' disabled={loading} style={{'width':'100%'}}> 
                        {loading ? 'Guardando...' : 'Guardar cambios'}
                    </Button>

                    {error && <span style={{'color':'red'}}>{error}</span>}
                </form>
            </div>
		</>	
	);
}