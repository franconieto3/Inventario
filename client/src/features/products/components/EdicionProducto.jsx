import { useEffect, useState } from "react";

import { apiCall } from "../../../services/api";
import Buscador from "../../../components/ui/Buscador";
import Button from "../../../components/ui/Button";
import { Modal } from '../../../components/ui/Modal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function EdicionProducto({producto, rubros, registrosPM, onClose, onUploadSuccess}){

    // Estados del formulario
    
    const [nombre, setNombre] = useState(producto.nombre);
    const [rubro, setRubro] = useState(producto.id_rubro);
    const [registro, setRegistro] = useState(producto.id_registro_pm);

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true); // Para la carga inicial de datos
    const [error, setError] = useState(null);

    const handleSubmit = async (e)=>{
        
        e.preventDefault();
        
        try{
            setError("");
            setLoading(true);

            //Verificar que haya cambiado al menos un campo
            if(nombre === producto.nombre && rubro === producto.id_rubro && registro === producto.id_registro_pm){
                throw new Error("No hubo modificaciones en el producto");
            }

            //El nombre no puede ser una cadena vacía
            if(nombre===""){
                throw new Error("Es obligatorio especificar el nombre");
            }
            const payload ={
                nombre: nombre,
                idRubro: rubro,
                idRegistroPm: registro
            }

            const respuesta = await apiCall(`${API_URL}/api/productos/edicion/${producto.id_producto}`, {method: 'PUT', body: JSON.stringify(payload)});
            
            //alert("Producto modificado exitosamente.");

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
            <Modal
                titulo="Editar producto"
                descripcion={producto.nombre}
                onClose={onClose}
            >
                <form onSubmit={handleSubmit}>
                    <div className="input-descripcion" style={{ 'width': '100%', 'justifyContent': 'space-between' }}>
                        <span style={{ 'width': '50%', 'textAlign': 'start' }}>Nombre:</span>
                        <input
                            style={{padding:'10px', fontSize: '0.9rem', border:'1px solid #ccccccdc', borderRadius:'6px', width:'100%'}}
                            placeholder={nombre}
                            className="input-text"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>
                    <div className="input-descripcion" style={{ 'width': '100%', 'justifyContent': 'space-between' }}>
                        <span style={{ 'width': '50%', 'textAlign': 'start' }}>
                        Editar registro de producto médico:
                        </span>
                        <Buscador
                            opciones={registrosPM}
                            placeholder= {registrosPM.filter((item)=> item.id_registro_pm === registro).map((e)=>`${e.id_registro_pm} - ${e.descripcion}`).join(',')}
                            keys={['id_registro_pm','descripcion']}
                            onChange={(id)=>setRegistro(id)}
                            idField="id_registro_pm"
                            displayField="descripcion"
                            showId={true}
                            valorInicial={producto.id_registro_pm}
                        /> 
                    </div>
                    <div className="input-descripcion" style={{ 'width': '100%', 'justifyContent': 'space-between' }}>
                        <span style={{ 'width': '50%', 'textAlign': 'start' }}>Editar rubro:</span>
                        <Buscador 
                            opciones={rubros} 
                            placeholder={rubros.filter((item)=> item.id_rubro === rubro).map((e)=>`${e.id_rubro} - ${e.descripcion}`).join(',')}
                            keys={['id_rubro', 'descripcion']} 
                            onChange={(id)=>setRubro(id)} 
                            idField="id_rubro" 
                            displayField="descripcion"
                            showId={true}
                            valorInicial={producto.id_rubro}
                        />
                    </div>


                    <Button 
                        variant="default" 
                        type="submit" 
                        disabled={loading}
                        style={{width:'100%', marginTop:'20px', marginBottom: '10px'}}
                    >
                        {loading ? 'Guardando...' : 'Guardar cambios'}
                    </Button>


                    {error && <p style={{ 'color': 'red', fontSize: '0.9rem' }}>{error}</p>}
                </form>

            </Modal>
        </>
    );
} 