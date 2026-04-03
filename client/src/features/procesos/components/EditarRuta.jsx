import { useRef, useState, useEffect } from "react"
import Buscador from "../../../components/ui/Buscador";
import { useProcesos } from "../hooks/useProcesos";
import Button from "../../../components/ui/Button";
import { apiCall } from "../../../services/api";

// Puedes reutilizar el mismo CSS
import './CrearRuta.css'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function EditarRuta({ rutaEdit, onSubmit, onReturn, onClose }) {

    const { procesos } = useProcesos();
    
    // Estados de edición
    const [nombreRuta, setNombreRuta] = useState("");
    const [rutaSecuencia, setRutaSecuencia] = useState([]);

    const [errorEdicionRuta, setErrorEdicionRuta] = useState("");
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(0);

    const dragItem = useRef();
    const dragOverItem = useRef();

    // Inicializar el estado con los datos recibidos
    useEffect(() => {
        if (rutaEdit) {
            setNombreRuta(rutaEdit.nombre || "");
            
            if (rutaEdit.proceso_bop) {
                // Mapeamos la estructura anidada a la estructura plana que usa la UI
                const secuenciaInicial = [...rutaEdit.proceso_bop]
                    .sort((a, b) => a.orden_secuencia - b.orden_secuencia)
                    .map(item => ({
                        id_proceso: item.proceso.id_proceso,
                        nombre: item.proceso.nombre,
                        // Mantenemos el id_proceso_ruta original si existe, sino generamos uno
                        stepId: item.id_proceso_ruta ? item.id_proceso_ruta.toString() : Date.now().toString() + Math.random().toString(36).substring(2),
                        requiere_inspeccion: item.requiere_inspeccion,
                        id_proceso_ruta: item.id_proceso_ruta // Útil para que el backend sepa si es un proceso existente
                    }));
                
                setRutaSecuencia(secuenciaInicial);
            }
        }
    }, [rutaEdit]);

    const handleSeleccionarProceso = (id) => {
        const procesoSeleccionado = procesos.find(p => p.id_proceso === id);
        if (procesoSeleccionado) {
            const nuevoPaso = {
                id_proceso: procesoSeleccionado.id_proceso,
                nombre: procesoSeleccionado.nombre,
                stepId: Date.now().toString() + Math.random().toString(36).substring(2),
                requiere_inspeccion: false,
                id_proceso_ruta: null // Es nuevo, no tiene ID de ruta en la BD aún
            };
            setRutaSecuencia([...rutaSecuencia, nuevoPaso]);
        }
        setReload(reload + 1);
    };
    
    const handleGuardarRuta = async () => {
        setErrorEdicionRuta("");
        if (!nombreRuta) {
            setErrorEdicionRuta("El nombre de la ruta es obligatorio");
            return;
        }
        if (rutaSecuencia.length === 0) {
            setErrorEdicionRuta("La ruta debe incluir al menos un proceso");
            return;
        }
        
        try {
            setLoading(true);
            const res = await apiCall(`${API_URL}/api/procesos/ruta/update/${rutaEdit.id_bop}`,{
                method: 'PUT',
                body: JSON.stringify({
                        id_bop: rutaEdit.id_bop,
                        nombre: nombreRuta,
                        procesos: rutaSecuencia.map((item, i) => ({
                            id_proceso: item.id_proceso,
                            id_proceso_ruta: item.id_proceso_ruta, // null si fue agregado en esta edición
                            orden_secuencia: i + 1,
                            requiere_inspeccion: item.requiere_inspeccion
                        }
                        ))
                    })
            }
            );

            console.log("Ruta editada exitosamente");
            if (onSubmit) onSubmit();
            if (onClose) onClose();

        } catch (err) {
            setErrorEdicionRuta(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarPaso = (stepId) => {
        setRutaSecuencia(rutaSecuencia.filter(paso => paso.stepId !== stepId));
    };

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
        const nuevaRuta = [...rutaSecuencia];
        const draggedItemContent = nuevaRuta[dragItem.current];
        
        nuevaRuta.splice(dragItem.current, 1);
        nuevaRuta.splice(dragOverItem.current, 0, draggedItemContent);
        
        dragItem.current = null;
        dragOverItem.current = null;
        
        setRutaSecuencia(nuevaRuta);
    };
    
    return(
        <>
            <h3 className="modal-title" style={{textAlign:'start', marginBottom:'10px'}}>Editar ruta</h3>
            <input 
                type="text" 
                className="nombre-ruta" 
                placeholder="Nombre de la ruta..."
                onChange={(e) => setNombreRuta(e.target.value)}
                value={nombreRuta}
            />
            
            <Buscador
                key={reload}
                opciones={procesos}
                placeholder="Añadir más procesos"
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
                            onDragOver={(e) => e.preventDefault()}
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
                        onClick={() => {
                            setRutaSecuencia([]);
                            setNombreRuta("");
                            onReturn();
                        }}
                    >
                        Cancelar
                    </Button>
                }
                <Button
                    variant="default" 
                    onClick={handleGuardarRuta}
                    disabled={loading}
                >
                    Guardar cambios
                </Button>
            </div>
            {errorEdicionRuta && <p style={{color:'red', textAlign:'center', marginTop:'15px', marginBottom:'0'}}>{errorEdicionRuta}</p>}
        </>
    )
}