import { useRef, useState } from "react"
import Buscador from "../../../components/ui/Buscador";
import { useProcesos } from "../hooks/useProcesos";
import Button from "../../../components/ui/Button";
import { apiCall } from "../../../services/api";

import './CrearRuta.css';
import { useEffect } from "react";

export function CrearRuta({tipos, onSubmit, onReturn, onClose}){

    const {allProcesos} = useProcesos();
    
    //Creación de ruta
    const [nombreRuta, setNombreRuta] = useState("");
    const [tipoRuta, setTipoRuta] = useState("");
    const [rutaSecuencia, setRutaSecuencia] = useState([]);

    const [errorCreacionRuta, setErrorCreacionRuta] = useState("");
    const [loading, setLoading] = useState(false);

    const [reload, setReload] = useState(0);

    const dragItem = useRef();
    const dragOverItem = useRef();

    const handleSeleccionarProceso = (id) => {
        const procesoSeleccionado = allProcesos.find(p => p.id_proceso === id);
        if (procesoSeleccionado) {
            // Usamos Date.now() para generar un ID único de paso, 
            // permitiendo que el mismo proceso se añada varias veces a la ruta.
            const nuevoPaso = {
                ...procesoSeleccionado,
                stepId: Date.now().toString() + Math.random().toString(36).substring(2),
                requiere_inspeccion: false
            };
            setRutaSecuencia([...rutaSecuencia, nuevoPaso]);
        }
        setReload(reload+1)
    };
    
    const handleCrearRuta = async ()=>{
        setErrorCreacionRuta("")
        if(!nombreRuta){
            setErrorCreacionRuta("El nombre de la ruta es obligatorio")
            return;
        }
        if(!tipoRuta){
            setErrorCreacionRuta("Es obligatorio especificar el tipo de ruta");
            return;
        }
        if(rutaSecuencia.length === 0){
            setErrorCreacionRuta("La ruta a crear debe incluir al menos un proceso");
            return;
        }
        try{
            await onSubmit({
                nombre: nombreRuta,
                id_tipo_ruta: Number(tipoRuta),
                procesos: rutaSecuencia.map((item, i)=>{
                    return {...item, orden_secuencia: i+1}
                })
            });

            console.log("Ruta creada exitosamente");
            if(onClose) onClose();

            setNombreRuta("");
            setTipoRuta("");
            setRutaSecuencia([]);

        }catch(err){
            setErrorCreacionRuta(err.message);
        }
        
    }

    const handleEliminarPaso = (stepId) => {
        setRutaSecuencia(rutaSecuencia.filter(paso => paso.stepId !== stepId));
    };

    // Nueva función para manejar el cambio del checkbox
    const handleToggleInspeccion = (stepId) => {
        setRutaSecuencia(rutaSecuencia.map(paso => 
            paso.stepId === stepId 
                ? { ...paso, requiere_inspeccion: !paso.requiere_inspeccion }
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

            <div className="shadcn-form-group">
                <select
                    id="id_tipo_ruta"
                    name="id_tipo_ruta"
                    className="shadcn-select"
                    value={tipoRuta}
                    onChange={(e)=>setTipoRuta(e.target.value)}
                    required
                >
                    <option value="" disabled>Tipo de ruta...</option>
                    {tipos?.map((tipo) => (
                    
                    <option key={tipo.id_tipo_ruta} value={tipo.id_tipo_ruta}>
                        {tipo.descripcion}
                    </option>
                    ))}
                </select>
            </div>
            
            <Buscador
                key={reload}
                opciones={allProcesos}
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
                                        checked={paso.requiere_inspeccion}
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
                    disabled={loading}
                >
                    Listo
                </Button>
            </div>
            {errorCreacionRuta && <p style={{color:'red', textAlign:'center', marginTop:'15px', marginBottom:'0'}}>{errorCreacionRuta}</p>}
        </>
    )
}