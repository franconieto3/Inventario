import { useState } from "react";
import { useProcesos } from "../hooks/useProcesos";
import { apiCall } from "../../../services/api";

import "./CrearProceso.css";
import Button from "../../../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function CrearProceso({ onClose, onSuccess }) {
  const { unidades } = useProcesos();
  
  const [formData, setFormData] = useState({
    nombre: "",
    unidad_tiempo: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError("");
    console.log(formData);
    try {
      const response = await apiCall(`${API_URL}/api/procesos/new`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      
    if (onSuccess) onSuccess();
    if (onClose) onClose();

    } catch (err) {
      setError("Error de conexión con el servidor.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shadcn-card">

      <form onSubmit={handleSubmit} className="shadcn-form">
        {error && <div className="shadcn-error-msg">{error}</div>}
        
        <div className="shadcn-form-group">
          <label htmlFor="nombre" className="shadcn-label">
            Nombre del Proceso
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            className="shadcn-input"
            placeholder="Ej. Ensamblaje de piezas"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="shadcn-form-group">
          <label htmlFor="unidad_tiempo" className="shadcn-label">
            Unidad de Medición (Tiempo)
          </label>
          <select
            id="unidad_tiempo"
            name="unidad_tiempo"
            className="shadcn-select"
            value={formData.unidad_tiempo}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Selecciona una unidad...</option>
            {unidades?.map((unidad) => (
              <option key={unidad} value={unidad}>
                {unidad}
              </option>
            ))}
          </select>
        </div>

        <div className="shadcn-dialog-footer">
            <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
            >
                Cancelar
            </Button>
            <Button 
            variant="default"
            type="submit"
            disabled={isSubmitting}
            >
            {isSubmitting ? "Guardando..." : "Crear Proceso"}
            </Button>
        </div>
      </form>
    </div>
  );
}