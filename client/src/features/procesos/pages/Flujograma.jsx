import { useState, useRef, useEffect } from 'react';
import './Flujograma.css';
import Buscador from '../../../components/ui/Buscador';
import { useProcesos } from '../hooks/useProcesos';
import NavBar from '../../../components/layout/NavBar';
import Button from '../../../components/ui/Button';
import { Arista } from './Arista'; 
import { useProcessRoutes } from '../hooks/useProcessRoutes';
import { apiCall } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

// Garantizamos el inicio y fin estructural de la ruta de fabricación
const INITIAL_NODES = [
  {
    id_nodo: 'nodo_inicio',
    id_proceso: null,
    label: 'Inicio de Ruta',
    requiere_inspeccion: false,
    x: 50,
    y: 200,
    inicio: true,
    fin: false
  },
  {
    id_nodo: 'nodo_fin',
    id_proceso: null,
    label: 'Fin de Ruta',
    requiere_inspeccion: false,
    x: 800,
    y: 200,
    inicio: false,
    fin: true
  }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function Flujograma() {
  const { allProcesos } = useProcesos();
  const { tipos } = useProcessRoutes();
  const navigate = useNavigate();

  const [showBuscador, setShowBuscador] = useState(false);

  //Atributos del grafo
  const [nombre, setNombre] = useState("");
  const [tipoRuta, setTipoRuta] = useState("");
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [edges, setEdges] = useState([]);

  const [loading, setLoading] = useState(false);
  
  //Estados para conexión de nodos
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [procesoPadre, setProcesoPadre] = useState(null);
  const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);

  // Estados de UI para Dragging Libre
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartNodePos = useRef({ x: 0, y: 0 });

  // --- ENVIO DE DATOS

    const handleSubmit = async () => {
        // Validaciones
        if (!nombre || nombre === "") {
            alert("El nombre de la ruta es obligatorio");
            return;
        }
        if (!tipoRuta || tipoRuta === "") {
            alert("Debe especificar el tipo de ruta");
            return;
        }

        // 1. Mapeo de Nodos
        const nodosFormateados = nodes.map(node => ({
            id_local: node.id_nodo,
            id_proceso: node.id_proceso ? parseInt(node.id_proceso) : null,
            requiere_inspeccion: node.requiere_inspeccion || false,
            x: Math.round(node.x),
            y: Math.round(node.y),
            inicio: node.inicio || false,
            fin: node.fin || false
        }));

        // 2. Mapeo de Aristas
        const aristasFormateadas = edges.map(edge => ({
            origen_local: edge.id_nodo_origen,
            destino_local: edge.id_nodo_destino,
            prioridad: edge.prioridad ? parseInt(edge.prioridad) : 1
        }));

        // 3. Estructura del Payload final
        const payload = {
        ruta: {
            nombre: nombre,
            id_tipo_ruta: parseInt(tipoRuta)
        },
        nodos: nodosFormateados,
        aristas: aristasFormateadas
        };

        try {
            setLoading(true);

            const res = await apiCall(`${API_URL}/api/procesos/ruta-procesos/new`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            console.log("Grafo creado exitosamente:", res.message);
            navigate("/procesos");

        } catch (err) {
            console.error("Error al enviar el grafo:", err);
        } finally {
            setLoading(false);
        }
    }

  // --- LÓGICA DE RUTAS Y GRAFOS ---

  const handleAddChild = (parentId, childData) => {
    const parentNode = nodes.find((n) => n.id_nodo === parentId);
    if (!parentNode || parentNode.fin) return; // Validación de seguridad

    const newNodeId = `nodo_${Date.now()}`;
    const newNode = {
      id_nodo: newNodeId,
      id_proceso: childData.id_proceso,
      label: childData.nombre,
      requiere_inspeccion: false,
      x: parentNode.x + 300, // Posicionamiento por defecto
      y: parentNode.y,
      inicio: false,
      fin: false
    };

    setNodes([...nodes, newNode]);
    setEdges([...edges, { id_nodo_origen: parentId, id_nodo_destino: newNodeId, prioridad: 1 }]);
    
    setShowBuscador(false);
    setProcesoPadre(null);
    setProcesoSeleccionado(null);
  };

  const handleDeleteNode = (nodeIdToDelete) => {
    const nodeToDelete = nodes.find(n => n.id_nodo === nodeIdToDelete);
    if (!nodeToDelete || nodeToDelete.inicio || nodeToDelete.fin) return;

    // Elimina el nodo y limpia las aristas huérfanas
    setNodes(nodes.filter(n => n.id_nodo !== nodeIdToDelete));
    setEdges(edges.filter(e => e.id_nodo_origen !== nodeIdToDelete && e.id_nodo_destino !== nodeIdToDelete));
  };

  const handleDeleteEdge = (origenId, destinoId) => {
    setEdges(prevEdges => prevEdges.filter(
      e => !(e.id_nodo_origen === origenId && e.id_nodo_destino === destinoId)
    ));
  };

  const handleEdgePriorityChange = (origenId, destinoId, newValue) => {
    setEdges(prevEdges => prevEdges.map(edge => 
      (edge.id_nodo_origen === origenId && edge.id_nodo_destino === destinoId) 
        ? { ...edge, prioridad: Number(newValue) } 
        : edge
    ));
  };

  const handleStartConnection = (sourceId) => {
    setConnectingFrom(sourceId);
  };

  const handleNodeClick = (targetId) => {
    if (connectingFrom) {
      const targetNode = nodes.find(n => n.id_nodo === targetId);
      
      // Evitamos conexiones circulares triviales, conectar al inicio, conectar un nodo de fin hacia afuera o conectar el inicio con el final.
      if (connectingFrom !== targetId && !targetNode.inicio) {
        const edgeExists = edges.some(e => e.id_nodo_origen === connectingFrom && e.id_nodo_destino === targetId);
        if(targetNode.fin && connectingFrom === 'nodo_inicio'){
            alert("No es posible conectar el inicio con el final directamente")
            return;
        }
        if (!edgeExists) {
          setEdges([...edges, { id_nodo_origen: connectingFrom, id_nodo_destino: targetId, prioridad: 1 }]);
        }
      }
      setConnectingFrom(null);
    }
  };

  const updateNodeData = (id, field, value) => {
    setNodes(nodes.map(n => n.id_nodo === id ? { ...n, [field]: value } : n));
  };

    const handleDragStart = (e, nodeId) => {
        // Evitar iniciar el drag si se interactúa con inputs o botones
        if (
            e.target.tagName.toLowerCase() === 'input' || 
            e.target.closest('button') || 
            e.target.closest('.node-actions')
        ) {
            return;
        }
        
        const node = nodes.find(n => n.id_nodo === nodeId);
        if(!node) return;

        setDraggingNodeId(nodeId);

        // Identificar si es evento de mouse o touch para extraer coordenadas
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        dragStartPos.current = { x: clientX, y: clientY };
        dragStartNodePos.current = { x: node.x, y: node.y };
    };

  const CloseSearchBar = () => {
    setShowBuscador(false);
    setProcesoPadre(null);
    setProcesoSeleccionado(null);
  };

  useEffect(() => {
    if(!procesoSeleccionado) return;
    handleAddChild(procesoPadre, procesoSeleccionado);
  }, [procesoSeleccionado]);

  // Manejo de Movimiento Independiente en 2 Ejes
    useEffect(() => {
        const handleMove = (e) => {
            if (!draggingNodeId) return;

            // Extraer coordenadas dependiendo del tipo de evento
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

            const dx = clientX - dragStartPos.current.x;
            const dy = clientY - dragStartPos.current.y;

            setNodes(prev => prev.map(n => {
                if (n.id_nodo === draggingNodeId) {
                    return { 
                        ...n, 
                        x: dragStartNodePos.current.x + dx,
                        y: dragStartNodePos.current.y + dy
                    };
                }
                return n;
            }));
        };

        const handleEnd = () => setDraggingNodeId(null);

        if (draggingNodeId) {
            // Listeners para Mouse
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleEnd);
            // Listeners para Touch
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [draggingNodeId]);


  return (
    <>
        <NavBar/>
        <div className="graph-top-bar">
            {/* Mantuvimos top bar sin cambios... */}
            <div className="graph-title-section">
                <i className="material-icons text-gray-500">account_tree</i>
                <input 
                    type="text" 
                    className="graph-name-input"
                    placeholder="Nombre de la ruta productiva..."
                    value={nombre}
                    onChange={(e)=>setNombre(e.target.value)}
                />
            </div>
            <div>
                <select
                    id="id_tipo_ruta"
                    name="id_tipo_ruta"
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
            <div className="graph-actions-section">
                <Button variant='default' onClick={handleSubmit} disabled={loading}>
                    Guardar Ruta
                </Button>
            </div>
        </div>

        <div className={`graph-editor-container ${connectingFrom ? 'connecting-mode' : ''}`}>
            {connectingFrom && (
                <div className="connection-toast">
                Selecciona el proceso de destino para el puente... 
                <button onClick={() => setConnectingFrom(null)}>Cancelar</button>
                </div>
            )}
            
            {showBuscador && 
            <div style={{
                margin: '15px', position: 'sticky', top: '15px', zIndex: '100',
                display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center'
            }}>
                <Buscador
                    placeholder="Buscar procesos..."
                    opciones={allProcesos}
                    keys={['id_proceso', 'nombre']}
                    onChange={(id, nombre, proceso) => setProcesoSeleccionado(proceso)}
                    idField="id_proceso"
                    displayField="nombre"
                    showId={false}
                />
                <button className='search-button' onClick={CloseSearchBar}>
                    <i className='material-icons'>close</i>
                </button>
            </div>}

            <svg className="graph-edges-layer">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                    </marker>
                </defs>
                {edges.map((edge) => (
                    <Arista 
                        key={`${edge.id_nodo_origen}-${edge.id_nodo_destino}`}
                        edge={edge}
                        sourceNode={nodes.find(n => n.id_nodo === edge.id_nodo_origen)}
                        targetNode={nodes.find(n => n.id_nodo === edge.id_nodo_destino)}
                        onPriorityChange={handleEdgePriorityChange}
                        onDelete={handleDeleteEdge}
                    />
                ))}
            </svg>

            {nodes.map(node => (
                <div 
                    key={node.id_nodo}
                    className={`graph-node ${node.inicio || node.fin ? 'node-root' : ''} ${connectingFrom === node.id_nodo ? 'node-active' : ''}`}
                    style={{ left: node.x, top: node.y }}
                    onMouseDown={(e) => handleDragStart(e, node.id_nodo)}
                    onTouchStart={(e) => handleDragStart(e, node.id_nodo)}
                    onClick={() => handleNodeClick(node.id_nodo)}
                >
                    <div className="node-header">
                        <span className="node-title" style={node.inicio || node.fin ? { fontWeight: 'bold', color: '#1e293b' } : {}}>
                            {node.label}
                        </span>
                    </div>

                    {(!node.inicio && !node.fin) && (
                        <div className="node-body">
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={node.requiere_inspeccion} 
                                    onChange={(e) => updateNodeData(node.id_nodo, 'requiere_inspeccion', e.target.checked)}
                                /> Requiere inspección
                            </label>
                        </div>
                    )}

                    <div className="node-actions">
                        {!node.fin && (
                            <>
                                <button onClick={(e) => { e.stopPropagation(); setProcesoPadre(node.id_nodo); setShowBuscador(true); }} title="Agregar Proceso Siguiente">
                                    <i className="material-icons">add</i>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleStartConnection(node.id_nodo); }} title="Puentear a otro proceso">
                                    <i className="material-icons">link</i>
                                </button>
                            </>
                        )}
                        
                        {(!node.inicio && !node.fin) && (
                            <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id_nodo); }} title="Eliminar Proceso">
                                <i className="material-icons" style={{color:'red'}}>delete</i>
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </>
  );
}