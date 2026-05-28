import {useState, useEffect} from 'react'
import { apiCall } from '../../../services/api';
import validarPrimeros3Digitos from '../../../services/validarCodigo';
import Button from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

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
            if(!nombrePieza) {
                setError("El nombre de la pieza es obligatorio");
                return;
            }

            if(!validarPrimeros3Digitos(codigo)){
                setError("Los primeros 3 dígitos del código deben ser numéricos");
                return;
            }

            const payload = {
                nombrePieza: nombrePieza,
                codigo: codigo, 
                idProducto: producto.id_producto
            }

            const respuesta = await apiCall(`${API_URL}/api/productos/pieza/crear`, {method: 'POST', body: JSON.stringify(payload)});

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
        
        <button className='add-span' onClick={()=>{setAgregarPieza(true)}}>
            <i className='material-icons' id="add-icon">add</i>
            Agregar pieza
        </button>
        
        {agregarPieza &&
        <Modal 
            titulo="Agregar pieza"
            descripcion="Especifique el código y nombre de la pieza"
            onClose={()=>setAgregarPieza(false)}
        >
            <form onSubmit={handleSubmit} >
                <div className="input-codigo">
                    <div style={{'width':'50%', 'textAlign':'start'}}>Código de pieza: </div>
                    <div className="input-wrapper">
                        <span className="prefix">{String(producto.id_rubro).padStart(2, "0")} - </span>
                        <input
                            style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                            className="input-number"
                            type="text"
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
                        style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                        placeholder='Descripción...'
                        className="input-text"
                        type="text"
                        name="nombrePieza"
                        value={nombrePieza}
                        onChange={(e)=>setNombrePieza(e.target.value)}
                    />
                </div>
                    
                <Button variant='default' type="submit" disabled={loading} style={{width:'100%', marginTop: '20px'}}>
                        {loading?'Cargando':'Guardar'} 
                </Button>

                {error && <p style={{'color':'red'}}>{error}</p>}
            </form>
        </Modal>
        }
        </>
    );
}