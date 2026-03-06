import { useState } from 'react';
import './MaterialForm.css'; // Asegúrate de importar la hoja de estilos
import { apiCall } from '../../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const MaterialForm = ({ rubros= [], unidades=[], onSubmit }) => {
  const [formData, setFormData] = useState({
    id_rubro_material: '',
    id_unidad_medida:'',
    descripcion: '',
    unidad_medida: 'unidades',
    es_trazable: false,
  });

  const [atributosGenerales, setAtributosGenerales] = useState({
    alto_cm: '',
    ancho_cm: '',
    largo_mts: '',
    kg: '',
    litros: '',
    diam_mm: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [atributos, setAtributos] = useState([]);

  // Manejador para los atributos generales
  const handleAtributoGeneralChange = (e) => {
    const { name, value } = e.target;
    setAtributosGenerales(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAtributo = () => {
    setAtributos([...atributos, { key: '', value: '' }]);
  };

  const handleAtributoChange = (index, field, val) => {
    const nuevos = [...atributos];
    nuevos[index][field] = field === 'value' && !isNaN(val) && val.trim() !== '' ? Number(val) : val;
    setAtributos(nuevos);
  };

  const handleRemoveAtributo = (index) => {
    setAtributos(atributos.filter((_, i) => i !== index));
  };

  const LimpiarFormulario =()=>{
    setFormData({
    id_rubro_material: '',
    id_unidad_medida:'',
    descripcion: '',
    unidad_medida: 'unidades',
    es_trazable: false,
    });
    setAtributosGenerales({
    alto_cm: '',
    ancho_cm: '',
    largo_mts: '',
    kg: '',
    litros: '',
    diam_mm: ''
  });
    setAtributos([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Procesar atributos específicos dinámicos
    const atributosDinamicosJson = atributos.reduce((acc, curr) => {
      if (curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {});

    // 2. Procesar atributos generales (desestimar los vacíos y parsear a número)
    const atributosGeneralesJson = Object.entries(atributosGenerales).reduce((acc, [key, val]) => {
      if (val.trim() !== '') {
        acc[key] = !isNaN(val) ? Number(val) : val;
      }
      return acc;
    }, {});

    // 3. Unificar todos los atributos
    const atributosFinales = {
      ...atributosGeneralesJson,
      ...atributosDinamicosJson
    };

    const payload = {
      ...formData,
      atributos: Object.keys(atributosFinales).length > 0 ? atributosFinales : null,
    };

    console.log("Enviando:", payload);

    try {
      setLoading(true);
      setError("");
      const res = await apiCall(`${API_URL}/api/materiales/nuevo`, {
        method: 'POST', 
        body: JSON.stringify(payload)
      });
      LimpiarFormulario();
      console.log("Material cargado con éxito");
      // Si recibes onSubmit por props, es buena práctica llamarlo tras el éxito
      if(onSubmit) onSubmit(res);

    } catch(err) {
      console.log("Ocurrió un error: ", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mf-container">
      
      {/* Selector de Rubro */}
      <div className="mf-form-group">
        <label className="mf-label" htmlFor="rubro">Rubro</label>
        <select 
          id="rubro"
          required
          className="mf-select"
          value={formData.id_rubro_material}
          onChange={(e) => setFormData({...formData, id_rubro_material: e.target.value})}
        >
          <option value="" disabled>Seleccione un rubro...</option>
          {rubros.map(r => (
            <option key={r.id_rubro_material} value={r.id_rubro_material}>
              {r.descripcion}
            </option>
          ))}
        </select>
      </div>

      {/* Descripción (Ejemplo de input estándar) */}
      <div className="mf-form-group">
        <label className="mf-label" htmlFor="descripcion">Descripción</label>
        <input 
          id="descripcion"
          type="text"
          required
          placeholder="Ej: Barra Ø8mm. acero 316L"
          className="mf-input"
          value={formData.descripcion}
          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
        />
      </div>
        
      {/* Selector de unidades */}
      <div className="mf-form-group">
        <label className="mf-label" htmlFor="rubro">¿Cómo se mide su consumo?</label>
        <select 
          id="unidad"
          required
          className="mf-select"
          value={formData.id_unidad_medida}
          onChange={(e) => setFormData({...formData, id_unidad_medida: e.target.value})}
        >
          <option value="" disabled>Seleccione un criterio...</option>
          {unidades.map(u => (
            <option key={u.id_unidad_medida} value={u.id_unidad_medida}>
              {u.descripcion}
            </option>
          ))}
        </select>
      </div>

      {/* Trazabilidad (Checkbox) */}
      <div className="mf-checkbox-group">
        <input 
          id="es_trazable"
          type="checkbox" 
          className="mf-checkbox"
          checked={formData.es_trazable}
          onChange={(e) => setFormData({...formData, es_trazable: e.target.checked})}
        />
        <label htmlFor="es_trazable" className="mf-checkbox-label">
          Es trazable
        </label>
      </div>

      <div className="mf-form-group">
        <label className="mf-label">Atributos Generales Físicos (Completar solo los necesarios)</label>
        {/* Usamos un grid simple en línea para que quede compacto. Puedes moverlo a tu CSS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
          <input 
            type="number" step="any" name="alto_cm" placeholder="Alto (Cm)" className="mf-input"
            value={atributosGenerales.alto_cm} onChange={handleAtributoGeneralChange}
          />
          <input 
            type="number" step="any" name="ancho_cm" placeholder="Ancho (Cm)" className="mf-input"
            value={atributosGenerales.ancho_cm} onChange={handleAtributoGeneralChange}
          />
          <input 
            type="number" step="any" name="largo_mts" placeholder="Largo (Mts)" className="mf-input"
            value={atributosGenerales.largo_mts} onChange={handleAtributoGeneralChange}
          />
          <input 
            type="number" step="any" name="kg" placeholder="Peso (KG)" className="mf-input"
            value={atributosGenerales.kg} onChange={handleAtributoGeneralChange}
          />
          <input 
            type="number" step="any" name="litros" placeholder="Volumen (Lts)" className="mf-input"
            value={atributosGenerales.litros} onChange={handleAtributoGeneralChange}
          />
          <input 
            type="number" step="any" name="diam_mm" placeholder="Diám. (mm)" className="mf-input"
            value={atributosGenerales.diam_mm} onChange={handleAtributoGeneralChange}
          />
        </div>
      </div>

      {/* Atributos Dinámicos */}
      <div className="mf-form-group">
        <label className="mf-label">Atributos Específicos Adicionales</label>
        
        {atributos.map((attr, index) => (
          <div key={index} className="mf-attr-row">
            <input 
              placeholder="Ej: espesor_mm" 
              className="mf-input"
              value={attr.key} 
              onChange={(e) => handleAtributoChange(index, 'key', e.target.value)}
            />
            <input 
              placeholder="Ej: 4.0" 
              className="mf-input"
              value={attr.value} 
              onChange={(e) => handleAtributoChange(index, 'value', e.target.value)}
            />
            <button 
              type="button" 
              className="mf-btn mf-btn-outline mf-btn-icon" 
              onClick={() => handleRemoveAtributo(index)}
              title="Eliminar atributo"
            >
              ✕
            </button>
          </div>
        ))}
        
        <button 
          type="button" 
          className="mf-btn mf-btn-outline" 
          onClick={handleAddAtributo}
          style={{ marginTop: '0.25rem' }}
        >
          + Añadir Atributo
        </button>
      </div>

      <button type="submit" disabled={loading} className="mf-btn mf-btn-primary" style={{ marginTop: '1rem' }}>
        {loading ? 'Guardando...' : 'Guardar Material'}
      </button>

      {error && <p style={{'color':'red', marginTop: '1rem'}}> {error} </p>}
    </form>
  );
};