import { useState, useEffect } from 'react';
import './EditarMaterial.css'; 
import { apiCall } from '../../../services/api';
import Button from '../../../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function EditarMaterial({ material, rubros = [], unidades = [], onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    id_rubro_material: '',
    id_unidad_medida: '',
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

  const [atributos, setAtributos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar los datos del material seleccionado al abrir el modal
  useEffect(() => {
    if (material) {
      setFormData({
        id_rubro_material: material.id_rubro_material || '',
        id_unidad_medida: material.id_unidad_medida || '',
        descripcion: material.descripcion || '',
        es_trazable: material.es_trazable || false,
      });

      // Procesar y separar los atributos que vienen de la BD
      if (material.atributos && typeof material.atributos === 'object') {
        const generalKeys = ['alto_cm', 'ancho_cm', 'largo_mts', 'kg', 'litros', 'diam_mm'];
        const loadedGenerales = { alto_cm: '', ancho_cm: '', largo_mts: '', kg: '', litros: '', diam_mm: '' };
        const loadedDinamicos = [];

        Object.entries(material.atributos).forEach(([key, value]) => {
          if (generalKeys.includes(key)) {
            loadedGenerales[key] = value;
          } else {
            loadedDinamicos.push({ key, value });
          }
        });

        setAtributosGenerales(loadedGenerales);
        setAtributos(loadedDinamicos);
      }
    }
  }, [material]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Procesar atributos dinámicos
    const atributosDinamicosJson = atributos.reduce((acc, curr) => {
      if (curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {});

    // 2. Procesar atributos generales
    const atributosGeneralesJson = Object.entries(atributosGenerales).reduce((acc, [key, val]) => {
      // Validamos que val no sea undefined o null antes de usar trim()
      const strVal = val != null ? String(val) : '';
      if (strVal.trim() !== '') {
        acc[key] = !isNaN(strVal) ? Number(strVal) : strVal;
      }
      return acc;
    }, {});

    // 3. Unificar atributos
    const atributosFinales = {
      ...atributosGeneralesJson,
      ...atributosDinamicosJson
    };

    const payload = {
      ...formData,
      atributos: Object.keys(atributosFinales).length > 0 ? atributosFinales : null,
    };

    try {
      setLoading(true);
      setError("");
      // Asumiendo que tu endpoint de edición es PUT a /api/materiales/:id
      const res = await apiCall(`${API_URL}/api/materiales/${material.id_material}`, {
        method: 'PUT', 
        body: JSON.stringify(payload)
      });
      
      if(onSubmit) onSubmit(res);
      if(onClose) onClose();

    } catch(err) {
      console.log("Ocurrió un error: ", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="em-container">
      
      <div className="em-form-group">
        <label className="em-label" htmlFor="rubro">Rubro</label>
        <select 
          id="rubro"
          required
          className="em-select"
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

      <div className="em-form-group">
        <label className="em-label" htmlFor="descripcion">Descripción</label>
        <input 
          id="descripcion"
          type="text"
          required
          placeholder="Ej: Barra Ø8mm. acero 316L"
          className="em-input"
          value={formData.descripcion}
          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
        />
      </div>
        
      <div className="em-form-group">
        <label className="em-label" htmlFor="unidad">¿Cómo se mide su consumo?</label>
        <select 
          id="unidad"
          required
          className="em-select"
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

      <div className="em-checkbox-group">
        <input 
          id="es_trazable_edit"
          type="checkbox" 
          className="em-checkbox"
          checked={formData.es_trazable}
          onChange={(e) => setFormData({...formData, es_trazable: e.target.checked})}
        />
        <label htmlFor="es_trazable_edit" className="em-checkbox-label">
          Es trazable
        </label>
      </div>

      <div className="em-form-group">
        <label className="em-label">Atributos Generales Físicos (Completar solo los necesarios)</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
          <input 
            type="number" step="any" name="alto_cm" placeholder="Alto (Cm)" className="em-input"
            value={atributosGenerales.alto_cm} onChange={handleAtributoGeneralChange}
          />
          <input 
            type="number" step="any" name="ancho_cm" placeholder="Ancho (Cm)" className="em-input"
            value={atributosGenerales.ancho_cm} onChange={handleAtributoGeneralChange}
          />
          <input 
            type="number" step="any" name="largo_mts" placeholder="Largo (Mts)" className="em-input"
            value={atributosGenerales.largo_mts} onChange={handleAtributoGeneralChange}
          />
          <input 
            type="number" step="any" name="kg" placeholder="Peso (KG)" className="em-input"
            value={atributosGenerales.kg} onChange={handleAtributoGeneralChange}
          />
          <input 
            type="number" step="any" name="litros" placeholder="Volumen (Lts)" className="em-input"
            value={atributosGenerales.litros} onChange={handleAtributoGeneralChange}
          />
          <input 
            type="number" step="any" name="diam_mm" placeholder="Diám. (mm)" className="em-input"
            value={atributosGenerales.diam_mm} onChange={handleAtributoGeneralChange}
          />
        </div>
      </div>

      <div className="em-form-group">
        <label className="em-label">Atributos Específicos Adicionales</label>
        
        {atributos.map((attr, index) => (
          <div key={index} className="em-attr-row">
            <input 
              placeholder="Ej: espesor_mm" 
              className="em-input"
              value={attr.key} 
              onChange={(e) => handleAtributoChange(index, 'key', e.target.value)}
            />
            <input 
              placeholder="Ej: 4.0" 
              className="em-input"
              value={attr.value} 
              onChange={(e) => handleAtributoChange(index, 'value', e.target.value)}
            />
            <button 
              type="button" 
              className="em-btn-icon" 
              onClick={() => handleRemoveAtributo(index)}
              title="Eliminar atributo"
            >
              ✕
            </button>
          </div>
        ))}
        
        <button 
          type="button" 
          className="em-btn-outline" 
          onClick={handleAddAtributo}
        >
          + Añadir Atributo
        </button>
      </div>

      <Button variant="default" type="submit" disabled={loading}>
        {loading ? 'Actualizando...' : 'Actualizar Material'}
      </Button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}> {error} </p>}
    </form>
  );
}