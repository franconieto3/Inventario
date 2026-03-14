import { Modal } from "../../../components/ui/Modal"
import  Buscador from "../../../components/ui/Buscador"
import  Button from "../../../components/ui/Button"
import { useState, useRef, useEffect } from "react"
import { apiCall } from "../../../services/api";

import "./NuevaRutaProcesos.css"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function NuevaRutaProcesos({producto, piezas, onClose, onSuccess}){

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
    const [errorCreacionRuta, setErrorCreacionRuta] = useState("");

    //Selección de piezas
    const [mostrarPiezas, setMostrarPiezas] = useState(false);
    const [piezasSeleccionadas, setPiezasSeleccionadas] = useState([]);
    const [todasSeleccionadas, setTodasSeleccionadas] = useState(false);

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
        setRutaSeleccionada({
            nombre: nombreRuta,
            procesos: rutaSecuencia
        });
        setNombreRuta("");
        setRutaSecuencia([])
    }

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

        console.log("Creando ruta con la siguiente secuencia:", rutaSecuencia);
        const payload={
            ruta: rutaSeleccionada,
            piezas: piezasSeleccionadas
        }
        console.log(payload);
        try{
            const res = await apiCall(`${API_URL}/api/procesos/ruta/pieza`,{
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

    //Selección de piezas

    useEffect(
        ()=>{
          if (piezas?.length > 0 && piezasSeleccionadas.length === piezas.length) setTodasSeleccionadas(true)
        },
    [piezasSeleccionadas]);

    const handleTogglePieza = (id) => {
        setPiezasSeleccionadas(prev => 
            prev.includes(id) 
                ? prev.filter(piezaId => piezaId !== id) // Si ya está, la quita
                : [...prev, id] // Si no está, la agrega
        );
    };

    const handleSeleccionarTodo = () => {
        if (todasSeleccionadas) {
            setPiezasSeleccionadas([]); // Si ya están todas, limpia el array
            setTodasSeleccionadas(false);
        } else {
            // Si falta alguna, selecciona todas extrayendo sus IDs
            const todosLosIds = piezas.map(p => p.id_pieza); 
            setPiezasSeleccionadas(todosLosIds);
        }
    };

    //useEffect(()=>console.log(rutaSeleccionada),[rutaSeleccionada])

    return(
        <>
            <Modal
                titulo="Agregar ruta de procesos"
                descripcion="Especifique la ruta de procesos y asocie las piezas"
                onClose={onClose}
            >
                {mostrarSeleccionarRuta &&
                    <div>
                        {!rutaSeleccionada &&
                            <>
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
                                    onClick={
                                        ()=>{
                                            setMostrarSeleccionarRuta(false);
                                            setMostrarCrearRuta(true);
                                        }
                                    }
                                >
                                    Crear nueva ruta
                                </Button>
                            </div>
                        }

                    </div>
                }
                {mostrarCrearRuta &&
                    <div>
                        { !rutaSeleccionada &&
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
                                    <Button 
                                        variant="secondary" 
                                        onClick={
                                        ()=>{
                                            setRutaSecuencia([])
                                            setNombreRuta("");
                                            setMostrarCrearRuta(false)
                                            setMostrarSeleccionarRuta(true)
                                        }}
                                    >
                                        Volver
                                    </Button>
                                    <Button
                                        variant="default" 
                                        onClick={handleCrearRuta}
                                    >
                                        Listo
                                    </Button>
                                </div>
                                {errorCreacionRuta && <p style={{color:'red', textAlign:'center', marginTop:'15px', marginBottom:'0'}}>{errorCreacionRuta}</p>}
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
                    </div>
                }
         
                <div className="piezas-section">
                    <div className="piezas-header">
                        <h3 className="modal-title" style={{ textAlign: 'start', margin: 0 }}>
                            Asociar Piezas
                        </h3>
                        <Button 
                            variant="secondary" 
                            onClick={handleSeleccionarTodo}
                            // Opcional: deshabilitar si no hay piezas cargadas
                            disabled={!piezas || piezas.length === 0} 
                        >
                            {todasSeleccionadas ? "Deseleccionar todo" : "Seleccionar todo"}
                        </Button>
                    </div>

                    <div className="piezas-lista">
                        {piezas && piezas.map((p) => {
                            const isChecked = piezasSeleccionadas.includes(p.id_pieza);
                            return (
                                /* Usamos <label> para que hacer clic en cualquier parte de la fila marque el checkbox */
                                <label 
                                    key={p.id_pieza} 
                                    className={`pieza-item ${isChecked ? 'selected' : ''}`}
                                >
                                    <div className="checkbox-container">
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked}
                                            onChange={() => handleTogglePieza(p.id_pieza)}
                                        />
                                        <span className="pieza-nombre">
                                            {producto} {p.nombre}
                                        </span>
                                    </div>
                                </label>
                            );
                        })}
                        
                        {(!piezas || piezas.length === 0) && (
                            <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '10px' }}>
                                No hay piezas disponibles para este producto.
                            </p>
                        )}
                    </div>
                </div>
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