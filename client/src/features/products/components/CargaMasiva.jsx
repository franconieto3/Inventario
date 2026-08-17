import React, { useState } from 'react'; 
import { apiCall } from '../../../services/api';
import SubirArchivo from '../../../components/ui/SubirArchivo';
import { Modal } from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function CargaMasiva({ isOpen, onClose, onSuccess }) {
  const [erroresValidacion, setErroresValidacion] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Procesa y valida el texto del CSV
  const procesarCSV = (textoCsv) => {
    // Separa por saltos de línea y elimina líneas en blanco
    const lineas = textoCsv.split(/\r?\n/).filter((linea) => linea.trim() !== '');
    
    if (lineas.length < 2) {
      setErroresValidacion(['El archivo está vacío o no contiene datos válidos.']);
      setPreviewData(null);
      return;
    }

    const headers = lineas[0].split(',').map((h) => h.trim());
    const columnasEsperadas = ['Producto_Nombre', 'Registro_PM', 'ID_Rubro', 'Pieza_Nombre', 'Codigo_Produccion'];
    
    // Verifica que el CSV tenga las columnas mínimas
    const faltantes = columnasEsperadas.filter(col => !headers.includes(col));
    if (faltantes.length > 0) {
      setErroresValidacion([`Faltan columnas requeridas en el archivo: ${faltantes.join(', ')}`]);
      setPreviewData(null);
      return;
    }

    const mapaProductos = new Map();
    const errores = [];

    // Itera sobre las filas de datos
    for (let i = 1; i < lineas.length; i++) {
      const fila = lineas[i].split(',').map((c) => c.trim());
      
      const getValor = (columna) => {
        const index = headers.indexOf(columna);
        return index > -1 && fila[index] ? fila[index] : "";
      };

      const pNombre = getValor('Producto_Nombre');
      const pRegPM = parseInt(getValor('Registro_PM'), 10) || 0;
      const pRubro = parseInt(getValor('ID_Rubro'), 10) || 0;
      const piezaNombre = getValor('Pieza_Nombre'); // Permite string vacío
      const piezaCod = getValor('Codigo_Produccion');

      // Regla: El nombre del producto es obligatorio[cite: 1]
      if (!pNombre) {
        errores.push(`Fila ${i + 1}: El nombre del producto es obligatorio.`);
        continue; 
      }

      // Inicializa el producto en el mapa si no existe
      if (!mapaProductos.has(pNombre)) {
        mapaProductos.set(pNombre, {
          nombre: pNombre,
          id_registro_pm: pRegPM,
          id_rubro: pRubro,
          piezas: [],
          _nombresPiezasEnviadas: new Set() // Set auxiliar para validar unicidad
        });
      }

      const producto = mapaProductos.get(pNombre);

      // Regla: Dos piezas no pueden tener el mismo nombre dentro del mismo producto (incluyendo strings vacíos)[cite: 1]
      if (producto._nombresPiezasEnviadas.has(piezaNombre)) {
        errores.push(`Fila ${i + 1}: Pieza duplicada "${piezaNombre}" en el producto "${pNombre}".`);
      } else {
        producto._nombresPiezasEnviadas.add(piezaNombre);
        producto.piezas.push({
          nombre: piezaNombre,
          codigo_produccion: piezaCod
        });
      }
    }

    // Limpieza de objetos auxiliares y validación final de productos
    const payloadFinal = Array.from(mapaProductos.values()).map((p) => {
      // Regla: Un producto debe tener al menos una pieza asociada[cite: 1]
      if (p.piezas.length === 0) {
        errores.push(`El producto "${p.nombre}" no tiene piezas válidas asociadas.`);
      }
      
      // Eliminamos la propiedad auxiliar '_nombresPiezasEnviadas' antes de enviar
      const { _nombresPiezasEnviadas, ...productoLimpio } = p;
      return productoLimpio;
    });

    if (errores.length > 0) {
      setErroresValidacion(errores);
      setPreviewData(null);
    } else {
      setErroresValidacion([]);
      setPreviewData(payloadFinal);
    }
  };

  // Manejador del Dropzone
  const handleUpload = (files) => {
    if (!files || files.length === 0) {
      setPreviewData(null);
      setErroresValidacion([]);
      return;
    }

    const archivo = files[0];
    const reader = new FileReader();
    reader.onload = (e) => procesarCSV(e.target.result);
    reader.readAsText(archivo);
  };

  const handleRemove = () => {
    setPreviewData(null);
    setErroresValidacion([]);
  };

  // Envío de datos al backend utilizando apiCall
  const enviarAlBackend = async () => {
    if (!previewData) return;
    
    try {
      setIsUploading(true);
      setErroresValidacion([]);
      
      const respuesta = await apiCall(`${API_URL}/api/productos/masivo`, {
        method: 'POST',
        body: JSON.stringify(previewData)
      });
      
      if (onSuccess) onSuccess(respuesta);
      onClose();

    } catch (error) {
      setErroresValidacion([error.message || 'Error de red al intentar enviar los datos.']);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
      titulo="Carga Masiva de Productos" 
      descripcion="Sube un archivo CSV con las columnas: Producto_Nombre, Registro_PM, ID_Rubro, Pieza_Nombre, Codigo_Produccion"
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Componente Dropzone[cite: 2] */}
        <SubirArchivo 
          acceptedFileTypes={['text/csv']} 
          onUpload={handleUpload} 
          onRemove={handleRemove} 
        />

        {/* Panel de Errores */}
        {erroresValidacion.length > 0 && (
          <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '5px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Se encontraron los siguientes errores:</p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
              {erroresValidacion.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Panel de Resumen/Preview */}
        {previewData && erroresValidacion.length === 0 && (
          <div style={{ padding: '10px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '5px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              ✓ Archivo validado correctamente.
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
              Se detectaron {previewData.length} productos listos para importar.
            </p>
          </div>
        )}

        {/* Acciones del Modal utilizando el componente Button[cite: 4] */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button 
            variant="default" 
            onClick={enviarAlBackend} 
            disabled={!previewData || erroresValidacion.length > 0 || isUploading}
          >
            {isUploading ? 'Enviando...' : 'Guardar Lote'}
          </Button>
        </div>

      </div>
    </Modal>
  );
}