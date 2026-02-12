import { useEffect, useState } from "react";
import { apiCall } from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function EdicionPieza({idPieza, pieza, producto, nombreInicial, codigoInicial, onClose, onUploadSuccess}){

    // Estados del formulario
    const [codigo, setCodigo] = useState(codigoInicial);
    const [nombrePieza, setNombrePieza] = useState(nombreInicial);

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true); // Para la carga inicial de datos
    const [error, setError] = useState(null);

    const handleSubmit = async (e)=>{
        e.preventDefault();
        
        try{
            setError("");
            setLoading(true);
            
            //El nombre no puede ser una cadena vacía
            if(nombrePieza===""){
                throw new Error("Es obligatorio especificar el nombre");
            }
            const payload ={
                nombre: nombrePieza,
                codigo: codigo === "" ? null : Number(codigo),
                idProducto: producto.id_producto
            }
            console.log(payload);
            const respuesta = await apiCall(`${API_URL}/api/productos/pieza/edicion/${idPieza}`, {method: 'PUT', body: JSON.stringify(payload)});
            

            if (onUploadSuccess) {
                onUploadSuccess();
            }

        }catch(err){
            setError(err.message);
            setLoading(false);
        }finally{
            setLoading(false);
        }

    }

    return(
        <>
            <div className="overlay">
                <div className="modal">
                    <div style={{'display':'flex', "gap":"8px"}}>
                        <div>
                        <i className='material-icons' id='close-button' onClick={onClose}>close</i>
                        </div>
                        <div style={{'width':'100%'}}>
                            <h3 style={{"fontSize":"1rem", "textAlign":'start','paddingTop':'10px', 'paddingBottom':'10px'}}>{`Editar ${producto.nombre + " " + nombreInicial}`}</h3>
                            <form onSubmit={handleSubmit}>
                                
                                <div className="input-codigo">
                                    <div style={{ 'width': '50%', 'textAlign': 'start' }}>Código de pieza: </div>
                                    <div className="input-wrapper">
                                        <span className="prefix">
                                            {producto.id_rubro ? String(producto.id_rubro).padStart(2, "0") : "00"} - 
                                        </span>
                                        <input
                                            className="input-number"
                                            type="number"
                                            name="codigoPieza"
                                            placeholder={codigoInicial}
                                            value={codigo}
                                            onChange={(e) => setCodigo(e.target.value)}
                                        />
                                        <span className="suffix">- XX</span>
                                    </div>
                                </div>
                                
                                <div className="input-descripcion" style={{ 'width': '100%', 'justifyContent': 'space-between' }}>
                                    <span style={{ 'width': '50%', 'textAlign': 'start' }}>{producto.nombre}:</span>
                                    <input
                                        placeholder={nombreInicial}
                                        className="input-text"
                                        type="text"
                                        value={nombrePieza}
                                        onChange={(e) => setNombrePieza(e.target.value)}
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
                                {error && <p style={{ 'color': 'red', fontSize: '0.9rem' }}>{error}</p>}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 