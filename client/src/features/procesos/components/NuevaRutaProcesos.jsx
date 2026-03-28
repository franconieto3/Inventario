import { Modal } from "../../../components/ui/Modal"
import  Buscador from "../../../components/ui/Buscador"
import  Button from "../../../components/ui/Button"
import { useState, useRef, useEffect } from "react"
import { apiCall } from "../../../services/api";
import { useProcesos } from "../hooks/useProcesos";

import "./NuevaRutaProcesos.css"
import { CrearRuta } from "./CrearRuta";
import { useProcessRoutes } from "../hooks/useProcessRoutes";


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function NuevaRutaProcesos({producto, piezas, onClose, onSuccess}){

    const {procesos} = useProcesos();
    const {rutas} = useProcessRoutes();

    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(0);
    const [error, setError] = useState("");

    //Selección de ruta
    const [mostrarSeleccionarRuta, setMostrarSeleccionarRuta] = useState(true)
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

    const [mostrarCrearRuta, setMostrarCrearRuta] = useState(false);

    //Selección de piezas
    const [mostrarPiezas, setMostrarPiezas] = useState(false);
    const [piezasSeleccionadas, setPiezasSeleccionadas] = useState([]);
    const [todasSeleccionadas, setTodasSeleccionadas] = useState(false);

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
                                    keys={['id_bop','nombre']}
                                    onChange={(id,nombre, ruta)=>{
                                        setRutaSeleccionada(ruta)
                                        setReload(reload+1)
                                    }}
                                    idField="id_bop"
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
                                <CrearRuta 
                                    onSubmit={(r)=>setRutaSeleccionada(r)}
                                    onReturn={()=>{
                                        setMostrarCrearRuta(false)
                                        setMostrarSeleccionarRuta(true)   
                                    }}
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