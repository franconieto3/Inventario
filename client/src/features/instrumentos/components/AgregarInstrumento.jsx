import { useEffect, useState } from "react";
import { apiCall } from "../../../services/api";
import Buscador from "../../../components/ui/Buscador";

import "./AgregarInstrumento.css"; 
import Button from "../../../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AgregarInstrumento({ onClose, onSuccess, sectores, enums }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [resetBuscador, setResetBuscador] = useState(0);

    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const [formData, setFormData] = useState({
        tipo: 'ESTANDAR',
        descripcion: '',
        marca: '',
        modelo: '',
        nro_serie: '',
        sector: '',
        // Campos ESTANDAR
        tipo_proveedor: 'INTERNO',
        frecuencia_meses: '',
        // Campos PROBADOR
        usos_maximos: '',
        // General
        mes_vencimiento: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Preparamos el payload limpiando campos irrelevantes según el tipo
        // y parseando números para que coincidan con los tipos de PostgreSQL
        const payload = {
            tipo: formData.tipo,
            descripcion: formData.descripcion,
            marca: formData.marca || null,
            modelo: formData.modelo || null,
            nro_serie: formData.nro_serie || null,
            sector: formData.sector ? parseInt(formData.sector) : null,
            mes_vencimiento: formData.mes_vencimiento || null
        };

        if (formData.tipo === 'ESTANDAR') {
            payload.tipo_proveedor = formData.tipo_proveedor;
            payload.frecuencia_meses = parseInt(formData.frecuencia_meses);
        } else if (formData.tipo === 'PROBADOR') {
            payload.usos_maximos = parseInt(formData.usos_maximos);
        }

        try {
            // Asumo el endpoint '/api/instrumentos', ajústalo a tu backend
            const response = await apiCall(`${API_URL}/api/instrumentos`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Si la petición es exitosa, cerramos el modal y notificamos al padre
            if (onSuccess) onSuccess(response);
            if (onClose) onClose();

        } catch (err) {
            setError(err.message || "Ocurrió un error al guardar el instrumento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ai-form-container">
            {error && <div className="ai-form-error">{error}</div>}

            <div className="ai-form-grid">
                {/* TIPO DE INSTRUMENTO */}
                <div className="ai-form-group">
                    <label htmlFor="tipo" className="ai-form-label">Tipo de Elemento *</label>
                    <select 
                        name="tipo" 
                        id="tipo"
                        className="ai-form-input" 
                        value={formData.tipo} 
                        onChange={handleChange}
                        required
                    >
                        {
                            enums.tiposInstrumento.map((item, i)=>(<option key={i} value={item}>{item}</option>))
                        }
                    </select>
                </div>

                {/* DESCRIPCIÓN */}
                <div className="ai-form-group ai-col-span-2">
                    <label htmlFor="descripcion" className="ai-form-label">Descripción *</label>
                    <input 
                        type="text" 
                        name="descripcion" 
                        id="descripcion"
                        className="ai-form-input" 
                        value={formData.descripcion} 
                        onChange={handleChange}
                        placeholder="Ej: Calibre pie de rey 150mm"
                        required 
                    />
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

                {/* SECTOR - (A futuro se llenará con useInstrumentos) */}
                <div className="ai-form-group">
                    <label htmlFor="sector" className="ai-form-label">Sector (ID temporal)</label>
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        <Buscador 
                            opciones={sectores}
                            key={resetBuscador}
                            placeholder="Sector..."
                            keys={['id_sector', 'descripcion']}
                            onChange={(e)=>handleChange({target: {name:'sector', value: e}})}
                            idField="id_sector"
                            displayField="descripcion"
                            showId={false}
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


                {/* ---------------- CAMPOS CONDICIONALES ---------------- */}
                {formData.tipo === 'ESTANDAR' && (
                    <>
                        <div className="ai-form-group">
                            <label htmlFor="tipo_proveedor" className="ai-form-label">Proveedor *</label>
                            <select 
                                name="tipo_proveedor" id="tipo_proveedor"
                                className="ai-form-input" value={formData.tipo_proveedor} onChange={handleChange}
                                required
                            >
                                {
                                    enums.tiposProveedor.map((item, i)=>
                                        (<option key={i} value={item}>{item}</option>)                   
                                    )
                                }
                            </select>
                        </div>
                        <div className="ai-form-group">
                            <label htmlFor="frecuencia_meses" className="ai-form-label">Frecuencia de calib. (Meses) *</label>
                            <input 
                                type="number" name="frecuencia_meses" id="frecuencia_meses" min="1"
                                className="ai-form-input" value={formData.frecuencia_meses} onChange={handleChange}
                                required
                            />
                        </div>
                    </>
                )}

                {formData.tipo === 'PROBADOR' && (
                    <div className="ai-form-group">
                        <label htmlFor="usos_maximos" className="ai-form-label">Usos Máximos *</label>
                        <input 
                            type="number" name="usos_maximos" id="usos_maximos" min="1"
                            className="ai-form-input" value={formData.usos_maximos} onChange={handleChange}
                            required
                        />
                    </div>
                )}
                {/* -------------------------------------------------------- */}

                {/* MES VENCIMIENTO */}
                <div className="ai-form-group">
                    <label htmlFor="mes_vencimiento" className="ai-form-label">Mes Vencimiento (Físico)</label>
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
                    {loading ? "Guardando..." : "Guardar Instrumento"}
                </button>
            </div>
        </form>
    );
}