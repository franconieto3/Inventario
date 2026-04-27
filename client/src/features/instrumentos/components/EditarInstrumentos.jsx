import { useState, useEffect } from "react";
import { apiCall } from "../../../services/api";
import Buscador from "../../../components/ui/Buscador";
import Button from "../../../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function EditarInstrumentos({ instrumento, onClose, onSuccess, enums, sectores }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resetBuscador, setResetBuscador] = useState(0);

    // Inicializamos el estado formateando la fecha si existe
    const [formData, setFormData] = useState({
        marca: '',
        modelo: '',
        nro_serie: '',
        sector: '',
        mes_vencimiento: ''
    });

    // Cargar los datos del instrumento seleccionado cuando el componente se monte
    useEffect(() => {
        if (instrumento) {
            setFormData({
                marca: instrumento.marca || '',
                modelo: instrumento.modelo || '',
                nro_serie: instrumento.nro_serie || '',
                sector: instrumento.sector || '',
                mes_vencimiento: instrumento.mes_vencimiento 
                    ? instrumento.mes_vencimiento.split('T')[0] 
                    : ''
            });
        }
    }, [instrumento]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Preparamos el payload base
        const payload = {
            marca: formData.marca || null,
            modelo: formData.modelo || null,
            nro_serie: formData.nro_serie || null,
            mes_vencimiento: formData.mes_vencimiento || null,
            sector: formData.sector || null
        };
        
        try {
            // Se utiliza PATCH o PUT pasando el ID del instrumento
            const response = await apiCall(`${API_URL}/api/instrumentos/${instrumento.id_instrumento}`, {
                method: 'PUT', // o 'PATCH' dependiendo de cómo esté configurado tu backend
                body: JSON.stringify(payload)
            });

            if (onSuccess) onSuccess(response);
            if (onClose) onClose();

        } catch (err) {
            setError(err.message || "Ocurrió un error al actualizar el instrumento");
        } finally {
            setLoading(false);
        }
    };

    if (!instrumento) return null;

    return (
        <form onSubmit={handleSubmit} className="ai-form-container">
            {error && <div className="ai-form-error">{error}</div>}

            <div className="ai-form-grid">

                <div className="ai-form-group ai-col-span-2">
                    <label htmlFor="descripcion" className="ai-form-label">Sector</label>
                    <div style={{display:'flex', gap: '10px', alignItems:'center'}}>
                        <Buscador 
                            opciones={sectores}
                            key={resetBuscador}
                            placeholder="Sector..."
                            keys={['id_sector', 'descripcion']}
                            onChange={(e)=>handleChange({target: {name:'sector', value: e}})}
                            idField="id_sector"
                            displayField="descripcion"
                            showId={false}
                            valorInicial={instrumento.sector}
                        />
                        <Button 
                            type='button'
                            variant="secondary" 
                            onClick={
                                ()=>{
                                    handleChange({target: {name: 'sector',value: ''}});
                                    setResetBuscador(resetBuscador + 1)
                            }
                            }
                            style={{maxWidth:'50px', marginBottom:'11px'}}
                        >
                            <i className="material-icons" style={{color:'red'}}>delete</i>
                        </Button>
                    </div>
                </div>

                {/* MARCA, MODELO, NRO SERIE */}
                <div className="ai-form-group">
                    <label htmlFor="marca" className="ai-form-label">Marca</label>
                    <input 
                        type="text" name="marca" id="marca"
                        className="ai-form-input" value={formData.marca} onChange={handleChange}
                    />
                </div>
                <div className="ai-form-group">
                    <label htmlFor="modelo" className="ai-form-label">Modelo</label>
                    <input 
                        type="text" name="modelo" id="modelo"
                        className="ai-form-input" value={formData.modelo} onChange={handleChange}
                    />
                </div>
                <div className="ai-form-group">
                    <label htmlFor="nro_serie" className="ai-form-label">Número de Serie</label>
                    <input 
                        type="text" name="nro_serie" id="nro_serie"
                        className="ai-form-input" value={formData.nro_serie} onChange={handleChange}
                    />
                </div>

                {/* MES VENCIMIENTO */}
                <div className="ai-form-group">
                    <label htmlFor="mes_vencimiento" className="ai-form-label">Fecha Vencimiento</label>
                    <input 
                        type="date" name="mes_vencimiento" id="mes_vencimiento"
                        className="ai-form-input" value={formData.mes_vencimiento} onChange={handleChange}
                    />
                </div>
            </div>

            <div className="ai-form-actions">
                <button type="button" className="ai-btn-outline" onClick={onClose} disabled={loading}>
                    Cancelar
                </button>
                <button type="submit" className="ai-btn-primary" disabled={loading}>
                    {loading ? "Actualizando..." : "Actualizar Instrumento"}
                </button>
            </div>
        </form>
    );
}