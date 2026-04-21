import { useState, useEffect } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function EditarInstrumentos({ instrumento, onClose, onSuccess, enums }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Inicializamos el estado formateando la fecha si existe
    const [formData, setFormData] = useState({
        descripcion: '',
        marca: '',
        modelo: '',
        nro_serie: '',
        tipo_proveedor: 'INTERNO',
        frecuencia_meses: '',
        usos_maximos: '',
        mes_vencimiento: ''
    });

    // Cargar los datos del instrumento seleccionado cuando el componente se monte
    useEffect(() => {
        if (instrumento) {
            setFormData({
                descripcion: instrumento.descripcion || '',
                marca: instrumento.marca || '',
                modelo: instrumento.modelo || '',
                nro_serie: instrumento.nro_serie || '',
                tipo_proveedor: instrumento.tipo_proveedor || 'INTERNO',
                frecuencia_meses: instrumento.frecuencia_meses || '',
                usos_maximos: instrumento.usos_maximos || '',
                // Aseguramos que la fecha tenga el formato YYYY-MM-DD para el input type="date"
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
            descripcion: formData.descripcion,
            marca: formData.marca || null,
            modelo: formData.modelo || null,
            nro_serie: formData.nro_serie || null,
            mes_vencimiento: formData.mes_vencimiento || null
        };

        // Agregamos campos condicionales según el tipo de instrumento original
        if (instrumento.tipo === 'ESTANDAR') {
            payload.tipo_proveedor = formData.tipo_proveedor;
            payload.frecuencia_meses = formData.frecuencia_meses ? parseInt(formData.frecuencia_meses) : null;
        } else if (instrumento.tipo === 'PROBADOR') {
            payload.usos_maximos = formData.usos_maximos ? parseInt(formData.usos_maximos) : null;
        }

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

                {/* ---------------- CAMPOS CONDICIONALES ---------------- */}
                {instrumento.tipo === 'ESTANDAR' && (
                    <>
                        <div className="ai-form-group">
                            <label htmlFor="tipo_proveedor" className="ai-form-label">Proveedor *</label>
                            <select 
                                name="tipo_proveedor" id="tipo_proveedor"
                                className="ai-form-input" value={formData.tipo_proveedor} onChange={handleChange}
                                required
                            >
                                {/* Validar que enums se esté pasando como prop para iterar aquí */}
                                {enums?.tiposProveedor?.map((item, i) => (
                                    <option key={i} value={item}>{item}</option>                   
                                ))}
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

                {instrumento.tipo === 'PROBADOR' && (
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