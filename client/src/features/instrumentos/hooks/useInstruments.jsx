// hooks/useInstruments.js
import { useState, useEffect, useCallback } from 'react';
import { 
  TipoInstrumento, 
  TipoProveedor, 
  TipoArchivoInstrumento 
} from '../constants/constantes'; // Ajusta la ruta según tu proyecto
import { apiCall } from '../../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useInstruments = (initialParams) => {
  const [instrumentos, setInstrumentos] = useState([]);
  const [sectores, setSectores] = useState([
        {
            id_sector: 1,
            descripcion: "Ingeniería"
        },
        {
            id_sector: 2,
            descripcion: "Mecanizado 1"
        },
        {
            id_sector: 3,
            descripcion: "Mecanizado 2"
        },
        {
            id_sector: 4,
            descripcion: "Mecanizado 3"
        },
        {
            id_sector: 5,
            descripcion: "Control de calidad"
        },
        {
            id_sector: 6,
            descripcion: "Pulido"
        }
    ]);

  const [totalRecords, setTotalRecords] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Exponemos las constantes como arrays para usar en selects/dropdowns del UI
  const enums = {
    tiposInstrumento: Object.values(TipoInstrumento),
    tiposProveedor: Object.values(TipoProveedor),
    tiposArchivo: Object.values(TipoArchivoInstrumento),
  };

  const fetchSectores = async () => {
    try {
      const data = await apiCall(`${API_URL}/api/instrumentos/sectores`, {})
      setSectores(data);
    } catch (err) {
      console.error("Error al cargar los sectores:", err);
    }
  };

  const fetchInstrumentos = useCallback(async (params) => {
    setLoading(true);
    try {
      // Usamos URLSearchParams para manejar los parámetros de la URL dinámicamente
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Solo agregamos los filtros si tienen un valor válido
      if (params.tipo) queryParams.append('tipo', params.tipo);
      if (params.sectorId) queryParams.append('sectorId', params.sectorId);
      if (params.estado) queryParams.append('estado', params.estado);

      const data = await apiCall(`${API_URL}/api/instrumentos/listado?${queryParams.toString()}`,{})
      
      setInstrumentos(data.items);
      setTotalRecords(data.total);
      setError(null);
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial de sectores
  useEffect(() => {
    fetchSectores();
  }, []);

  // Efecto que reacciona a los cambios en la paginación o filtros
  useEffect(() => {
    fetchInstrumentos(initialParams);
  }, [
    initialParams.page, 
    initialParams.limit, 
    initialParams.tipo, 
    initialParams.sectorId,
    initialParams.estado, 
    fetchInstrumentos
  ]);

  return {
    instrumentos,
    sectores,
    enums,
    totalRecords,
    loading,
    error,
    refetch: () => fetchInstrumentos(initialParams)
  };
};