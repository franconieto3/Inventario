import { useRef, useState } from "react"
import Buscador from "../../../components/ui/Buscador";
import { useProcesos } from "../hooks/useProcesos";
import Button from "../../../components/ui/Button";
import { apiCall } from "../../../services/api";

import './CrearRuta.css';

export function CrearRuta({onSubmit, onReturn, onClose}){

    const {procesos} = useProcesos();
    
    //Creación de ruta
    const [nombreRuta, setNombreRuta] = useState("");
    const [rutaSecuencia, setRutaSecuencia] = useState([]);
    const [errorCreacionRuta, setErrorCreacionRuta] = useState("");
    const [reload, setReload] = useState(0);

    const dragItem = useRef();
    const dragOverItem = useRef();

    const handleSeleccionarProceso = (id) => {
        const procesoSeleccionado = procesos.find(p => p.id_proceso === id);
        if (procesoSeleccionado) {
            // Usamos Date.now() para generar un ID único de paso, 
            // permitiendo que el mismo proceso se añada varias veces a la ruta.
            const nuevoPaso = {
                ...procesoSeleccionado,
                stepId: Date.now().toString() + Math.random().toString(36).substring(2),
                requiereInspeccion: false
            };
            setRutaSecuencia([...rutaSecuencia, nuevoPaso]);
        }
        setReload(reload+1)
    };
    
    const handleCrearRuta = ()=>{
        setErrorCreacionRuta("")
        if(!nombreRuta){
            setErrorCreacionRuta("El nombre de la ruta es obligatorio")
            return;
        }
        if(rutaSecuencia.length === 0){
            setErrorCreacionRuta("La ruta a crear debe incluir al menos un proceso");
            return;
        } 
        onSubmit({
            nombre: nombreRuta,
            procesos: rutaSecuencia.map((item, i)=>{
                return {...item, orden_secuencia: i+1}
            })
        });
        
        if(onClose) onClose();

        setNombreRuta("");
        setRutaSecuencia([])
    }

    const handleEliminarPaso = (stepId) => {
        setRutaSecuencia(rutaSecuencia.filter(paso => paso.stepId !== stepId));
    };

    // Nueva función para manejar el cambio del checkbox
    const handleToggleInspeccion = (stepId) => {
        setRutaSecuencia(rutaSecuencia.map(paso => 
            paso.stepId === stepId 
                ? { ...paso, requiereInspeccion: !paso.requiereInspeccion }
                : paso
        ));
    };

    // --- Funciones de Drag and Drop ---
    const handleDragStart = (e, index) => {
        dragItem.current = index;
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        // Clonamos la ruta actual
        const nuevaRuta = [...rutaSecuencia];
        // Extraemos el item que estamos arrastrando
        const draggedItemContent = nuevaRuta[dragItem.current];
        
        // Reordenamos el array
        nuevaRuta.splice(dragItem.current, 1); // Lo quitamos de su posición original
        nuevaRuta.splice(dragOverItem.current, 0, draggedItemContent); // Lo insertamos en la nueva
        
        // Reseteamos las referencias
        dragItem.current = null;
        dragOverItem.current = null;
        
        // Actualizamos el estado
        setRutaSecuencia(nuevaRuta);
    };
    
    return(
        <>
            <h3 className="modal-title" style={{textAlign:'start', marginBottom:'10px'}}>Crear nueva ruta</h3>
            <input 
                type="text" 
                className="nombre-ruta" 
                placeholder="Nombre de la ruta..."
                onChange={(e)=>setNombreRuta(e.target.value)}
                value={nombreRuta}
            />
            
            <Buscador
                key={reload}
                opciones={procesos}
                placeholder="Seleccionar procesos"
                keys={['id_proceso','nombre']}
                onChange={handleSeleccionarProceso}
                idField="id_proceso"
                displayField="nombre"
                showId={false}
                maxResults={20}
            />

            {/* Lista de procesos seleccionados */}
            {rutaSecuencia.length > 0 && (
                <div className="ruta-lista">
                    {rutaSecuencia.map((paso, index) => (
                        <div 
                            key={paso.stepId} 
                            className="ruta-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()} // Necesario para permitir el drop
                        >
                            <div className="ruta-item-info">
                                <span className="material-icons drag-icon">drag_indicator</span>
                                <span className="step-number">{index + 1}</span>
                                <span className="step-name">{paso.nombre}</span>
                            </div>
                            <div className="ruta-item-acciones">
                                <label className="checkbox-container">
                                    <input 
                                        type="checkbox" 
                                        checked={paso.requiereInspeccion}
                                        onChange={() => handleToggleInspeccion(paso.stepId)}
                                    />
                                    <span className="checkbox-label">Control de calidad</span>
                                </label>

                                <button 
                                    className="btn-eliminar"
                                    onClick={() => handleEliminarPaso(paso.stepId)}
                                    title="Quitar proceso"
                                >
                                    <span className="material-icons">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div style={{display:'flex', gap:'20px', alignItems:'center', justifyContent:'end'}}>
                {onReturn &&
                    <Button 
                        variant="secondary" 
                        onClick={
                        ()=>{
                            setRutaSecuencia([])
                            setNombreRuta("");
                            //setMostrarCrearRuta(false)
                            //setMostrarSeleccionarRuta(true)
                            onReturn();
                        }}
                    >
                        Volver
                    </Button>
                }
                <Button
                    variant="default" 
                    onClick={handleCrearRuta}
                >
                    Listo
                </Button>
            </div>
            {errorCreacionRuta && <p style={{color:'red', textAlign:'center', marginTop:'15px', marginBottom:'0'}}>{errorCreacionRuta}</p>}
        </>
    )
}