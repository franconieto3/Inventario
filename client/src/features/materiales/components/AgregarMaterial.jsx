import { useEffect, useState } from "react";
import Buscador from '../../../components/ui/Buscador';
import { apiCall } from "../../../services/api";
import Button from "../../../components/ui/Button";
import './AgregarMaterial.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AgregarMaterial({pieza, onClose, onSuccess}){

    const [selector, setSelector] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(1);

    const[materiales, setMateriales]=useState([])

    useEffect(()=>{
        const fetchMateriales = async ()=>{
            try{
                setLoading(true)
                const res = await apiCall(`${API_URL}/api/materiales/selector`,{});
                setSelector(res);
            }catch(err){
                console.log(err)
            }finally{
                setLoading(false);
            }
        }
        fetchMateriales();
        }
    ,[])
        
    const handleSelectMaterial = (id_material, descripcion, item) => {
        setMateriales((prev) => [...prev, { ...item, consumo: 0.0 }]);
        setReload((prev)=>prev+1)
    };
    
    const handleRemoveMaterial = (id_material) => {
        setMateriales((prev) => prev.filter(m => m.id_material !== id_material));
    };

    const handleQuantityChange = (id_material, value) => {
        const cantidad = parseInt(value, 10);
        setMateriales((prev) => prev.map(m => 
            m.id_material === id_material 
                ? { ...m, consumo: isNaN(cantidad) ? '' : cantidad } 
                : m
        ));
    };

    const submitMateriales = async ()=>{
        
        console.log("Subiendo materiales");
        if (materiales.length === 0){
            setError("Debes agregar al menos un material");
            return;
        }

        if(materiales.some(m => !m.consumo)){
            setError("Todas las cantidades deben ser mayores a 0.");
            return;
        }

        const payload = {
            idPieza: pieza.id_pieza,
            materiales: materiales.map(
                (m)=>({
                    id_material: m.id_material,
                    consumo: m.consumo
                })
            )
        }

        try{
            setLoading(true);
            setError("");

            const res = await apiCall(`${API_URL}/api/materiales/bom-pieza`,{
                method:'POST', 
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Cargando materiales...");
            
            if (onSuccess) onSuccess();
            if(onClose) onClose();

        }catch(err){
            setError(err.message || "Ocurrió un error al guardar los materiales.")
        }finally{
            setLoading(false);
        }
    }

    return (
        <>
            <div className="modal-content">
                <Buscador
                    opciones={selector}
                    placeholder="Buscar materiales"
                    key={reload}
                    keys={['id_material','descripcion']}
                    onChange={(id, value, material)=>{handleSelectMaterial(id,value, material)}}
                    idField='id_material'
                    displayField='descripcion'
                    showId={false}
                />

                {error && <p className="form-error">{error}</p>}

                <div className="material-list-container">
                    {materiales.length === 0 ? (
                        <p className="empty-state">No hay materiales agregados aún.</p>
                    ) : (
                        <ul className="material-list">
                            {materiales.map((m) => (
                                <li key={m.id_material} className="material-item">
                                    <span className="material-name">{m.descripcion}</span>
                                    <div className="material-actions">
                                        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                            <span>Consumo teórico: </span>
                                            <input 
                                                type="number" 
                                                min="1"
                                                className="shadcn-input"
                                                value={m.consumo}
                                                onChange={(e) => handleQuantityChange(m.id_material, e.target.value)}
                                            />
                                            <span>{m.unidad}</span>
                                        </div>
                                        <button 
                                            className="delete-btn" 
                                            onClick={() => handleRemoveMaterial(m.id_material)}
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
            </div>
            <div className="modal-footer">
                <Button variant="secondary" disabled={loading} onClick={submitMateriales}>
                    {loading ? "Guardando..." : "Guardar"}
                </Button>
            </div>
        </>
    )
}