import { useState } from "react";
import Button from "../../../components/ui/Button";
import { apiCall } from "../../../services/api";

export function EditarComponente({
    idPiezaPadre, 
    nombrePiezaPadre,
    componente,
    onClose, 
    onSuccess}){
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    const [cantidad, setCantidad] = useState(componente.cantidad);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submitComponents = async()=>{

        if (cantidad === "" || cantidad < 0) {
            console.error("La cantidad no es válida");
            return;
        }

        try{
            setLoading(true);
            setError("");
            
            const res = await apiCall(`${API_URL}/api/componentes/edit`,{
                method:'PUT',
                body: JSON.stringify({
                    idPiezaPadre,
                    idPiezaHijo: componente.id_pieza,
                    cantidad: Number(cantidad)
                })
            });

            if (onSuccess)onSuccess();
            if (onClose) onClose();

        }catch(err){
            console.log("Error al actualizar la cantidad:", err.message);
            setError(err.message);
        }finally{
            setLoading(false);
        }
    }
    
    return(
        <>
            <div className="overlay">
                <div className="modal">
                    <div className="modal-header">
                        <div style={{textAlign:'start'}}>
                            <h3 className="modal-title">Editar Componente</h3>
                            <p style={{fontSize:'1rem',marginTop:'5px'}}>{nombrePiezaPadre}</p>
                        </div>
                        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                            &times;
                        </button>
                    </div>

                    <div className="modal-content">
                        <div className="input-group">
                            <label htmlFor="cantidad" className="input-label">
                                Cantidad
                            </label>
                            <input 
                                id="cantidad"
                                type="number"
                                className="modern-input"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                placeholder="Ingrese la cantidad"
                                min="0"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <Button variant="secondary" disabled={loading} onClick={submitComponents}>
                            {loading ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                    {error && <p style={{'color': 'red'}}>{error}</p>}
                </div>
            </div>
        </>
    );
}