import { useState, useEffect } from "react";
import { useProcesos } from "../hooks/useProcesos";
import { apiCall } from "../../../services/api";


import "./CrearProceso.css"; 
import Button from "../../../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function EditarProceso({ proceso, onClose, onSuccess }) {
  const { tipos, unidades } = useProcesos();
  
  const [formData, setFormData] = useState({
    nombre: proceso?.nombre || "",
    id_tipo_proceso: proceso?.tipo_proceso?.id_tipo_proceso || proceso?.id_tipo_proceso || "",
    unidad_tiempo: proceso?.unidad_tiempo || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (proceso) {
      setFormData({
        nombre: proceso.nombre || "",
        id_tipo_proceso: proceso.tipo_proceso?.id_tipo_proceso || proceso.id_tipo_proceso || "",
        unidad_tiempo: proceso.unidad_tiempo || "",
      });
    }
  }, [proceso]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!proceso?.id_proceso) {
        setError("Error: No se ha provisto un ID válido para actualizar.");
        return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiCall(`${API_URL}/api/procesos/edicion/${proceso.id_proceso}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();

    } catch (err) {
      // Intentamos capturar el error enviado por el backend desde process.controller.js
      setError(err.message || "Error de conexión con el servidor.");
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
          <label htmlFor="id_tipo_proceso" className="shadcn-label">
            Tipo de Proceso
          </label>
          <select
            id="id_tipo_proceso"
            name="id_tipo_proceso"
            className="shadcn-select"
            value={formData.id_tipo_proceso}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Selecciona un tipo...</option>
            {tipos?.map((tipo) => (
              <option key={tipo.id_tipo_proceso} value={tipo.id_tipo_proceso}>
                {tipo.descripcion}
              </option>
            ))}
          </select>
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
                type="button"
                disabled={isSubmitting}
            >
                Cancelar
            </Button>
            <Button 
                variant="default"
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
        </div>
      </form>
    </div>
  );
}