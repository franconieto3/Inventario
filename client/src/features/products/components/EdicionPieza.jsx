import { useEffect, useState } from "react";

import { apiCall } from "../../../services/api";
import validarPrimeros3Digitos from "../../../services/validarCodigo";
import Button from "../../../components/ui/Button";

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

            if(!validarPrimeros3Digitos(codigo)){
                throw new Error("Los primeros 3 dígitos del código deben ser numéricos");
            }

            const payload ={
                nombre: nombrePieza,
                codigo: codigo,
                idProducto: producto.id_producto
            }
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
            <div className='modal-content'>
                <form onSubmit={handleSubmit}>
                    <div className="input-codigo">
                        <div style={{ 'width': '50%', 'textAlign': 'start' }}>Código de pieza: </div>
                        <div className="input-wrapper">
                            <span className="prefix">
                                {producto.id_rubro ? String(producto.id_rubro).padStart(2, "0") : "00"} - 
                            </span>
                            <input
                                style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                                className="input-number"
                                type="text"
                                name="codigoPieza"
                                placeholder={codigoInicial}
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                            />
                            <span className="suffix">- XX</span>
                        </div>
                    </div>
                    
                    <div className="input-descripcion" style={{ 'width': '100%', 'justifyContent': 'space-between', marginTop:'15px' }}>
                        <span style={{ 'width': '50%', 'textAlign': 'start' }}>{producto.nombre}:</span>
                        <input
                            style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                            placeholder={nombreInicial}
                            className="input-text"
                            type="text"
                            value={nombrePieza}
                            onChange={(e) => setNombrePieza(e.target.value)}
                        />
                    </div>
                    <div style={{ 'textAlign': 'start', 'paddingTop': '20px', 'paddingBottom': '10px' }}>
                        <Button variant='default' type='submit' disabled={loading} style={{'width':'100%'}}> 
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </div>
                    {error && <p style={{ 'color': 'red', fontSize: '0.9rem' }}>{error}</p>}
                </form>
            </div>
        </>
    );
} 