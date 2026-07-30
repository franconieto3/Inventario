import { useState, useRef, useEffect } from 'react';
import './Flujograma.css';
import Buscador from '../../../components/ui/Buscador';
import { useProcesos } from '../hooks/useProcesos';
import NavBar from '../../../components/layout/NavBar';
import Button from '../../../components/ui/Button';
import { Arista } from './Arista'; 
import { useProcessRoutes } from '../hooks/useProcessRoutes';
import { useNavigate, useParams } from 'react-router-dom';
import { useGraphProcessRoutes } from '../hooks/useGraphProcessRoutes';
import { useGraphEditor } from '../hooks/useGraphEditor';
import { useGetGraph } from '../hooks/useGetGraph';
import { validarPermiso } from '../../../services/validarPermiso';
import { Spinner } from '../../../components/ui/Spinner';

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

export function Flujograma() {

  const {id} = useParams();
  const isEditMode = Boolean(id);
  const isReadOnly = !validarPermiso('editar_rutas_procesos'); // Puedes enlazar esto a los permisos de App.jsx

  const { allProcesos } = useProcesos();
  const { tipos } = useProcessRoutes();

  const {handleSubmit, loading} = useGraphProcessRoutes();
  const { graphData, loadingData } = useGetGraph(id);

  //Atributos del grafo
  const [nombre, setNombre] = useState("");
  const [tipoRuta, setTipoRuta] = useState("");

  const { 
    nodes, setNodes, edges, setEdges,
    connectingFrom, setConnectingFrom,
    handleDragStart, handleAddChild, handleDeleteNode, handleDeleteEdge, 
    handleEdgePriorityChange, handleNodeClick, updateNodeData, handleStartConnection, procesoPadre, setProcesoPadre, procesoSeleccionado, setProcesoSeleccionado, showBuscador, setShowBuscador
  } = useGraphEditor(INITIAL_NODES, isReadOnly);

  const getNodeName = (nodo)=>{
    if(nodo.inicio) return 'Inicio de ruta';
    if(nodo.fin) return 'Fin de ruta';
    return nodo.nombre;
  }


  useEffect(() => {
      if (isEditMode && graphData) {
          setNombre(graphData.ruta.nombre);
          setTipoRuta(graphData.ruta.id_tipo_ruta);
          setNodes(graphData.nodos);
          setEdges(graphData.aristas);
      }
  }, [graphData, isEditMode]);

  
  const CloseSearchBar = () => {
    setShowBuscador(false);
    setProcesoPadre(null);
    setProcesoSeleccionado(null);
  };

  useEffect(() => {
    if(!procesoSeleccionado) return;
    handleAddChild(procesoPadre, procesoSeleccionado);
  }, [procesoSeleccionado]);


  if (loading) return (
    <>
        <div style={{ position: 'relative', minHeight: '200px' }}>
            <Spinner 
                size={40} 
                color="#64748b" 
                center 
                label = 'Cargando ruta de fabricación...'
            />
        </div>
    </>
  );

  return (
    <>
        <NavBar/>
        <div className="graph-top-bar">
            <div className="graph-title-section">
                <i className="material-icons text-gray-500">account_tree</i>
                <input 
                    type="text" 
                    className="graph-name-input"
                    placeholder="Nombre de la ruta productiva..."
                    value={nombre}
                    onChange={(e)=>setNombre(e.target.value)}
                    disabled={isReadOnly}
                />
            </div>
            <div>
                <select
                    id="id_tipo_ruta"
                    name="id_tipo_ruta"
                    value={tipoRuta}
                    onChange={(e)=>setTipoRuta(e.target.value)}
                    required
                    disabled={isReadOnly}
                >
                    <option value="" disabled>Tipo de ruta...</option>
                    {tipos?.map((tipo) => (
                    
                    <option key={tipo.id_tipo_ruta} value={tipo.id_tipo_ruta}>
                        {tipo.descripcion}
                    </option>
                    ))}
                </select>
            </div>
            {!isReadOnly && (
                <div className="graph-actions-section">
                    <Button variant='default' onClick={()=>handleSubmit(id, nombre, tipoRuta, nodes, edges, graphData)} disabled={loading}>
                        {isEditMode ? 'Actualizar Ruta' : 'Guardar Ruta'}
                    </Button>
                </div>
            )}
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
                        isReadOnly={isReadOnly}
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
                            {getNodeName(node)}
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
                    {!isReadOnly && (
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
                    )}
                </div>
            ))}
        </div>
    </>
  );
}