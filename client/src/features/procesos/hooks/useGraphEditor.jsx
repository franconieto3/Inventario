import { useState, useRef, useEffect } from 'react';

export function useGraphEditor(initialNodes, isReadOnly = false) {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState([]);
    
    // Estados para UI y Conexión
    const [connectingFrom, setConnectingFrom] = useState(null);
    const [procesoPadre, setProcesoPadre] = useState(null);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
    const [showBuscador, setShowBuscador] = useState(false);
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const dragStartNodePos = useRef({ x: 0, y: 0 });

    const handleAddChild = (parentId, childData) => {
        if (isReadOnly) return;

        const parentNode = nodes.find((n) => n.id_nodo === parentId);
        if (!parentNode || parentNode.fin) return; 

        const newNodeId = `nodo_${Date.now()}`;
        const newNode = {
            id_nodo: newNodeId,
            id_proceso: childData.id_proceso,
            label: childData.nombre,
            requiere_inspeccion: false,
            x: parentNode.x + 300,
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
        if (isReadOnly) return;
        const nodeToDelete = nodes.find(n => n.id_nodo === nodeIdToDelete);
        if (!nodeToDelete || nodeToDelete.inicio || nodeToDelete.fin) return;

        // Elimina el nodo y limpia las aristas huérfanas
        setNodes(nodes.filter(n => n.id_nodo !== nodeIdToDelete));
        setEdges(edges.filter(e => e.id_nodo_origen !== nodeIdToDelete && e.id_nodo_destino !== nodeIdToDelete));
    };

    const handleDeleteEdge = (origenId, destinoId) => {
        if (isReadOnly) return;
        setEdges(prevEdges => prevEdges.filter(
            e => !(e.id_nodo_origen === origenId && e.id_nodo_destino === destinoId)
        ));
    };

    const handleEdgePriorityChange = (origenId, destinoId, newValue) => {
        if (isReadOnly) return;
        setEdges(prevEdges => prevEdges.map(edge => 
        (edge.id_nodo_origen === origenId && edge.id_nodo_destino === destinoId) 
            ? { ...edge, prioridad: Number(newValue) } 
            : edge
        ));
    };

    const handleStartConnection = (sourceId) => {
        if (isReadOnly) return;
        setConnectingFrom(sourceId);
    };

    const handleNodeClick = (targetId) => {
        if (isReadOnly) return;

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
        if (isReadOnly) return;
        setNodes(nodes.map(n => n.id_nodo === id ? { ...n, [field]: value } : n));
    };
    
    const handleDragStart = (e, nodeId) => {
        if (isReadOnly) return; // Bloquear en modo solo lectura
        if (e.target.tagName.toLowerCase() === 'input' || e.target.closest('button') || e.target.closest('.node-actions')) {
            return;
        }
        
        const node = nodes.find(n => n.id_nodo === nodeId);
        if(!node) return;

        setDraggingNodeId(nodeId);
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        dragStartPos.current = { x: clientX, y: clientY };
        dragStartNodePos.current = { x: node.x, y: node.y };
    };

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

    return {
        nodes, setNodes, edges, setEdges,procesoPadre, setProcesoPadre, procesoSeleccionado, setProcesoSeleccionado, showBuscador, setShowBuscador,
        connectingFrom, setConnectingFrom,
        handleDragStart, handleAddChild, handleDeleteNode, handleDeleteEdge, 
        handleEdgePriorityChange, handleNodeClick, updateNodeData, handleStartConnection
    };
}