import { useState } from "react";
import Button from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { ToggleSelector } from "../../../components/ui/ToggleSelector";
import Buscador from "../../../components/ui/Buscador";
import { useInstruments } from "../hooks/useInstruments";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AsociarInstrumentoPieza({producto, onClose, onSuccess}){

    const {categorias} = useInstruments();
    const [reload, setReload] = useState(1);

    const [elementos, setElementos] = useState([]);
    const [piezasSeleccionadas, setPiezasSeleccionadas] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSelectInstrument = (id_categoria, descripcion, instrumento)=>{
        setElementos((prev) => {
            const alreadyExists = prev.some(e => e.id_categoria === id_categoria);
            
            if (alreadyExists) {
                return prev; 
            }

            return [...prev, instrumento]
        });
        setReload((prev)=>prev+1)
    }

    const handleRemoveInstrument = (id_categoria)=>{
        setElementos((prev) => prev.filter(e => e.id_categoria !== id_categoria));
    }

    const handleGuardar = async () => {
        setError("");
        console.log("Piezas listas para guardar:", piezasSeleccionadas);

        if (elementos.length === 0){
            setError("Debes agregar al menos un elemento de control");
            return;
        }

        if (piezasSeleccionadas.length === 0){
            setError("Debes seleccionar al menos una pieza");
            return;
        }

        const payload = {
            piezas: piezasSeleccionadas,
            elementos: elementos.map(
                (e)=>e.id_categoria
            )
        }
    
        try{
            setLoading(true);
            const res = await apiCall(`${API_URL}/api/instrumentos/pieza-instrumento`,{
                method:'POST', 
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (onSuccess) onSuccess();
            if(onClose) onClose();

        }catch(err){
            setError(err.message || "Ocurrió un error al guardar los elementos de control.")
        }finally{
            setLoading(false);
        }
    };


    return(
        <>
            <Modal
                titulo="Asociar elementos de control"
                descripcion=""
                onClose={onClose}
            >
                <div className="modal-content">
                    <Buscador
                        opciones={categorias}
                        placeholder="Buscar elementos de control"
                        key={reload}
                        keys={['id_categoria','descripcion']}
                        onChange={(id, value, instrument)=>{handleSelectInstrument(id,value, instrument)}}
                        idField='id_categoria'
                        displayField='descripcion'
                        showId={false}
                    />

                    <div className="material-list-container">
                        {elementos.length === 0 ? (
                            <p className="empty-state">No hay elementos de control agregados aún.</p>
                        ) : (
                            <ul className="material-list">
                                {elementos.map((e) => (
                                    <li key={e.id_categoria} className="material-item">
                                        <span className="material-name">{e.descripcion}</span>
                                        <div className="material-actions">
                                            <button 
                                                className="delete-btn" 
                                                onClick={() => handleRemoveInstrument(e.id_categoria)}
                                                title="Eliminar material"
                                            >
                                                <i className="material-icons">delete</i>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <ToggleSelector
                        titulo = "Asociar piezas"
                        items={producto?.pieza || []}
                        idField={'id_pieza'}
                        displayField={(item)=>`${producto?.nombre || ''} ${item.nombre}`}
                        selectedItems={piezasSeleccionadas}
                        onChangeSelection={setPiezasSeleccionadas}
                    />
                    {error && <div className="ai-form-error">{error}</div>}
                    <Button
                        variant="default"
                        onClick={handleGuardar}
                    >
                        Guardar
                    </Button>
                </div>
            </Modal>
        </>
    );
}