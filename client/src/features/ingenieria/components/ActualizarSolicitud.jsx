import React, { useState, useEffect } from 'react';
import { apiCall } from '../../../services/api'; // Ajusta la ruta a tu api.js
import Button from "../../../components/ui/Button";
import './ActualizarSolicitud.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function ActualizarSolicitud({ solicitud, onClose, onSuccess }) {
  // Función auxiliar para formatear la fecha a YYYY-MM-DD (formato requerido por input type="date")
  const formatInputDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    hora_inicio: solicitud?.hora_inicio || '',
    hora_fin: solicitud?.hora_fin || '',
    fecha_vencimiento: formatInputDate(solicitud?.fecha_vencimiento),
    estado: solicitud?.estado || 'PENDIENTE',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (!formData.hora_inicio || !formData.hora_fin || !formData.fecha_vencimiento || !formData.estado) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    // Validación lógica: hora fin debe ser posterior a hora inicio
    if (formData.hora_inicio >= formData.hora_fin) {
      setError('La hora de finalización debe ser posterior a la de inicio.');
      return;
    }

    setLoading(true);
    try {
      await apiCall(`${API_URL}/api/documentos/solicitud-acceso/edicion/${solicitud.id_solicitud}`, {
        method: 'PUT', 
        body: JSON.stringify(formData)
      });

      onSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al actualizar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-actualizar-solicitud" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="estado">Estado</label>
        <select
          id="estado"
          name="estado"
          className="form-control"
          value={formData.estado}
          onChange={handleChange}
        >
          <option value="PENDIENTE">Pendiente</option>
          <option value="APROBADA">Aprobada</option>
          <option value="RECHAZADA">Rechazada</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="fecha_vencimiento">Fecha de Vencimiento</label>
        <input
          type="date"
          id="fecha_vencimiento"
          name="fecha_vencimiento"
          className="form-control"
          value={formData.fecha_vencimiento}
          onChange={handleChange}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="hora_inicio">Hora de inicio</label>
          <input
            type="time"
            id="hora_inicio"
            name="hora_inicio"
            className="form-control"
            value={formData.hora_inicio}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="hora_fin">Hora de fin</label>
          <input
            type="time"
            id="hora_fin"
            name="hora_fin"
            className="form-control"
            value={formData.hora_fin}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
        </Button>
        <Button type="submit" variant="default" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}