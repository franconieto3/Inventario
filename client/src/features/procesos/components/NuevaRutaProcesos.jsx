import { Modal } from "../../../components/ui/Modal"
import  Buscador from "../../../components/ui/Buscador"
import  Button from "../../../components/ui/Button"
import { useState, useRef } from "react"
import { apiCall } from "../../../services/api";

import "./NuevaRutaProcesos.css"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function NuevaRutaProcesos({producto, piezas, onClose}){

    const rutas = [
        {
          id_ruta:1,
          nombre: "Tornillos canulados"  
        },
        {
            id_ruta: 2,
            nombre: "Placas de titanio"
        },
        {
            id_ruta: 3,
            nombre: "Tallos de cadera acero"
        }
    ]
    const procesos = [
        {
            id_proceso:1,
            nombre: "Mecanizado"
        },
        {
            id_proceso: 2,
            nombre: "Corte por hilo"
        },
        {
            id_proceso: 3,
            nombre: "Anodizado"
        },
        {
            id_proceso: 4,
            nombre: "Grabado"
        },
    ]

    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(0);
    const [error, setError] = useState("");

    //Selección de ruta
    const [mostrarSeleccionarRuta, setMostrarSeleccionarRuta] = useState(true)
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

    //Creación de ruta
    const[nombreRuta, setNombreRuta] = useState("");
    const [mostrarCrearRuta, setMostrarCrearRuta] = useState(false);
    const [rutaSecuencia, setRutaSecuencia] = useState([]);

    //Selección de piezas
    const [mostrarPiezas, setMostrarPiezas] = useState(false);
    const [piezasSeleccionadas, setPiezasSeleccionadas] = useState([]);

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

    const handleGuardarRuta = () => {
        console.log("Creando ruta con la siguiente secuencia:", rutaSecuencia);
        // Aquí iría tu lógica de apiCall...
    };

    return(
        <>
            <Modal
                titulo="Agregar ruta de procesos"
                descripcion="Especifique la ruta de procesos y asocie las piezas"
                onClose={onClose}
            >
                {mostrarSeleccionarRuta &&
                    <div>
                        <h3 className="modal-title" style={{textAlign:'start', marginBottom:'10px'}}>Seleccionar ruta</h3>
                        <Buscador
                            key={reload}
                            opciones={rutas}
                            placeholder="Seleccione una ruta ya existente"
                            keys={['id_ruta','nombre']}
                            onChange={(id,nombre, ruta)=>{
                                setRutaSeleccionada(ruta)
                                setReload(reload+1)
                            }}
                            idField="id_ruta"
                            displayField="nombre"
                            showId={false}
                            maxResults={20}
                        />

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
                        <div style={{display:'flex', gap:'20px', alignItems:'center', justifyContent:'end'}}>
                            <Button 
                                variant="secondary" 
                                onClick={
                                    ()=>{
                                        setRutaSeleccionada(null);
                                        setMostrarSeleccionarRuta(false);
                                        setMostrarCrearRuta(true);
                                    }
                                }
                            >
                                Crear nueva ruta
                            </Button>
                            <Button variant="default">
                                Aceptar
                            </Button>
                        </div>
                    </div>
                }
                {mostrarCrearRuta &&
                    <div>
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
                            <Button 
                                variant="secondary" 
                                onClick={
                                ()=>{
                                    setRutaSecuencia([])
                                    setMostrarCrearRuta(false)
                                    setMostrarSeleccionarRuta(true)
                                }}
                            >
                                Volver
                            </Button>
                            <Button variant="default">
                                Listo
                            </Button>
                        </div>
                    </div>
                }
                <div style={{textAlign:'start'}}>
                    <Button variant="secondary">
                        Seleccionar todo
                    </Button>
                </div>
                <ul>
                    {
                    piezas.map(
                        (p)=>(
                            <div style={{display:'flex'}}>
                                <input type="checkbox"/>
                                <li>
                                    {producto} {p.nombre}
                                </li>
                            </div>
                        )
                    )}
                </ul>
                
                <div className="modal-footer">
                    <Button variant="default" onClick={handleGuardarRuta}>
                        {loading ? "Guardando..." : "Guardar ruta"}
                    </Button>
                </div>
            </Modal>

            
        </>
    )
}