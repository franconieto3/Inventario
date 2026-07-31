import { Modal } from "../../../components/ui/Modal"
import  Buscador from "../../../components/ui/Buscador"
import  Button from "../../../components/ui/Button"
import { useState, useRef, useEffect } from "react"
import { apiCall } from "../../../services/api";
import { useProcessGraphs } from "../hooks/useProcessGraphs";
import { ToggleSelector } from "../../../components/ui/ToggleSelector";
import "./NuevaRutaProcesos.css"
import { useNavigate} from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AsociarRutaPiezas({producto, onClose, onSuccess}){

    const {allGrafos} = useProcessGraphs();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(0);
    const [error, setError] = useState("");

    //Selección de ruta
    const [mostrarSeleccionarRuta, setMostrarSeleccionarRuta] = useState(true)
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

    //Selección de piezas
    const [piezasSeleccionadas, setPiezasSeleccionadas] = useState([]);

    const handleGuardarRuta = async () => {
        setError("");
        setLoading(true);

        if(piezasSeleccionadas.length===0){
            setError("Debe seleccionar al menos una pieza");
            return;
        }
        if(!rutaSeleccionada){
            setError("Debe especificar la ruta de procesos");
            return;           
        }

        const payload={
            ruta: rutaSeleccionada.id_ruta,
            piezas: piezasSeleccionadas
        }
        
        try{
            const res = await apiCall(`${API_URL}/api/procesos/ruta/asignacion-pieza`,{
                method:'POST',
                body: JSON.stringify(payload)
            });
            
            setRutaSeleccionada(null);
            setPiezasSeleccionadas([]);

            if (onSuccess) onSuccess();
            if (onClose) onClose();

        }catch(err){
            console.error(err);
            setError(err.message);
        }finally{
            setLoading(false);
        }
        
    };

    return(
        <>
            <Modal
                titulo="Agregar ruta de procesos"
                descripcion="Especifique la ruta de procesos y asocie las piezas"
                onClose={onClose}
            >
                <div>
                    {!rutaSeleccionada &&
                        <>
                            <h3 className="modal-title" style={{textAlign:'start', marginBottom:'10px'}}>Seleccionar ruta</h3>
                            <Buscador
                                key={reload}
                                opciones={allGrafos}
                                placeholder="Seleccione una ruta ya existente"
                                keys={['id_ruta','nombre']}
                                onChange={(id,nombre, ruta)=>{
                                    setRutaSeleccionada(ruta)
                                    setReload(reload+1)
                                }}
                                idField="id_ruta"
                                displayField="nombre"
                                showId={false}
                                maxResults={50}
                            />
                        </>
                    }
                    {rutaSeleccionada &&
                        <div className="ruta-item" style={{cursor:'pointer', marginBottom:'15px'}}>
                            <div>
                                {rutaSeleccionada.nombre}
                            </div>
                            <button 
                                className="btn-eliminar"
                                onClick={() => setRutaSeleccionada(null)}
                                title="Quitar proceso"
                            >
                                <span className="material-icons">delete</span>
                            </button>
                        </div>
                    }
                    {!rutaSeleccionada &&
                        <div style={{display:'flex', gap:'20px', alignItems:'center', justifyContent:'end'}}>
                            <Button 
                                variant="secondary" 
                                onClick={()=>{navigate('/flujograma/new')}
                                }
                            >
                                Crear nueva ruta
                            </Button>
                        </div>
                    }

                </div>

                <ToggleSelector
                    titulo = "Asociar piezas"
                    items={producto?.pieza || []}
                    idField={'id_pieza'}
                    displayField={(item)=>`${producto?.nombre || ''} ${item.nombre}`}
                    selectedItems={piezasSeleccionadas}
                    onChangeSelection={setPiezasSeleccionadas}
                />

                {error && <p style={{color:'red', textAlign:'center', marginTop:'15px', marginBottom:'0px'}}>{error}</p>}

                <div className="modal-footer">
                    <Button variant="default" onClick={handleGuardarRuta}>
                        {loading ? "Guardando..." : "Guardar ruta"}
                    </Button>
                </div>
                
            </Modal>      
        </>
    )
}