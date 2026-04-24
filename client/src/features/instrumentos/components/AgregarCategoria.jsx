import { useEffect, useState } from "react";
import { apiCall } from "../../../services/api";
import Buscador from "../../../components/ui/Buscador";

import "./AgregarInstrumento.css"; 
import Button from "../../../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AgregarCategoria({ onClose, onSuccess, sectores, enums }){
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        tipo: 'ESTANDAR',
        descripcion: '',
        // Campos ESTANDAR
        tipo_proveedor: 'INTERNO',
        frecuencia_meses: '',
        // Campos PROBADOR
        usos_maximos: '',
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
        };

        if (formData.tipo === 'ESTANDAR') {
            payload.tipo_proveedor = formData.tipo_proveedor;
            payload.frecuencia_meses = parseInt(formData.frecuencia_meses);
        } else if (formData.tipo === 'PROBADOR') {
            payload.usos_maximos = parseInt(formData.usos_maximos);
        }

        try {
            // Asumo el endpoint '/api/instrumentos', ajústalo a tu backend
            const response = await apiCall(`${API_URL}/api/instrumentos/categoria`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Si la petición es exitosa, cerramos el modal y notificamos al padre
            if (onSuccess) onSuccess(response);
            if (onClose) onClose();

        } catch (err) {
            setError(err.message || "Ocurrió un error al crear la categoría de instrumentos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ai-form-container">
            {error && <div className="ai-form-error">{error}</div>}

            <div className="ai-form-grid">
                {/* TIPO DE INSTRUMENTO */}
                <div className="ai-form-group ai-col-span-2">
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
                        placeholder="Ej: Calibre digital"
                        required 
                    />
                </div>


                {/* ---------------- CAMPOS CONDICIONALES ---------------- */}

                <>
                    <div className="ai-form-group ai-col-span-2">
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
                    <div className="ai-form-group ai-col-span-2" >
                        <label htmlFor="frecuencia_meses" className="ai-form-label">Frecuencia de calib. (Meses) *</label>
                        <input 
                            type="number" name="frecuencia_meses" id="frecuencia_meses" min="1"
                            className="ai-form-input" value={formData.frecuencia_meses} onChange={handleChange}
                            required
                        />
                    </div>
                </>

                {formData.tipo === 'PROBADOR' && (
                    <div className="ai-form-group ai-col-span-2">
                        <label htmlFor="usos_maximos" className="ai-form-label">Usos Máximos *</label>
                        <input 
                            type="number" name="usos_maximos" id="usos_maximos" min="1"
                            className="ai-form-input" value={formData.usos_maximos} onChange={handleChange}
                            required
                        />
                    </div>
                )}
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