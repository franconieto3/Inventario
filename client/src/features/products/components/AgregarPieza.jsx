import {useState, useEffect} from 'react'
import { apiCall } from '../../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';


export function AgregarPieza({producto, onUploadSuccess}){

    const [agregarPieza, setAgregarPieza] = useState(false);

    //Estados de formulario
    const [codigo, setCodigo] = useState("");
    const [nombrePieza, setNombrePieza] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError("");
        setLoading(true);

        try{
            if(!nombrePieza) throw new Error("El nombre de la pieza es obligatorio")
            
            const payload = {
                nombrePieza: nombrePieza,
                codigo: codigo === "" ? null : Number(codigo), 
                idProducto: producto.id_producto
            }

            const respuesta = await apiCall(`${API_URL}/api/productos/pieza/crear`, {method: 'POST', body: JSON.stringify(payload)});
            //alert("Pieza creada exitosamente.");

            // Reset de formulario y cierre
            setCodigo("");
            setNombrePieza("");
            setAgregarPieza(false);

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);

        }
    }

    return(
        <>
        {!agregarPieza &&
        <button className='add-span' onClick={()=>{setAgregarPieza(true)}}>
            <i className='material-icons' id="add-icon">add</i>
            Agregar pieza
        </button>
        }
        {agregarPieza &&
        <div className='overlay'>
            <div className='modal' style={{'width':'350px'}}>
                <div style={{'display':'flex', "gap":"8px"}}>
                    <div>
                        <i className='material-icons' id='close-button' onClick={()=>setAgregarPieza(false)}>close</i>
                    </div>
                    <div style={{'width':'100%'}}>
                        <h3 style={{"fontSize":"1rem", "textAlign":'start','paddingTop':'10px', 'paddingBottom':'10px'}}>Agregar nueva pieza</h3>
                        <form onSubmit={handleSubmit} >
                            <div className="input-codigo">
                                <div style={{'width':'50%', 'textAlign':'start'}}>Código de pieza: </div>
                                <div className="input-wrapper">
                                    <span className="prefix">{String(producto.id_rubro).padStart(2, "0")} - </span>
                                    <input
                                        className="input-number"
                                        type="number"
                                        name="codigoPieza"
                                        min="1" 
                                        step="1" 
                                        value={codigo}
                                        onChange={(e)=>setCodigo(e.target.value)}
                                    />
                                    <span className="suffix">- XX</span>
                                </div>
                            </div>
                            <div className="input-descripcion" style={{'width':'100%', 'justifyContent':'space-between'}}>
                                <span style={{'width':'50%', 'textAlign':'start'}}>{producto.nombre}</span>
                                <input
                                    placeholder='Descripción...'
                                    className="input-text"
                                    type="text"
                                    name="nombrePieza"
                                    value={nombrePieza}
                                    onChange={(e)=>setNombrePieza(e.target.value)}
                                />
                            </div>
                            <div style={{'textAlign':'start', 'paddingTop':'10px', 'paddingBottom':'10px'}}>
                                <button style={{'backgroundColor':'#033545','color':'white','borderRadius':'8px'}} type="submit" disabled={loading?true:false}>{loading?'Cargando':'Guardar'}</button>
                            </div>
                            {error && <p style={{'color':'red'}}>{error}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
        }
        </>
    );
}