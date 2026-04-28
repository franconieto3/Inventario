import { useEffect, useState, useCallback } from 'react';
import { apiCall } from '../../../services/api'; // Ajusta la ruta según tu estructura
import './historialVerificaciones.css';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function HistorialVerificaciones({ idInstrumento, refreshTrigger, onDelete }) {
    const [verificaciones, setVerificaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const fetchVerificaciones = useCallback(async () => {
        setError('');
        try {
            setLoading(true);
            // Llamada al endpoint creado en el paso anterior
            const res = await apiCall(`${API_URL}/api/instrumentos/${idInstrumento}/verificaciones`);

            const datos = res.data ? res.data : res;
            setVerificaciones(Array.isArray(datos) ? datos : []);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [idInstrumento]);

    useEffect(() => {
        if (idInstrumento) {
            fetchVerificaciones();
        }
    }, [fetchVerificaciones, refreshTrigger]);

    // Función auxiliar para formatear la fecha a un formato legible (DD/MM/YYYY)
    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return '-';
        // Añadimos T00:00:00 para evitar desfasajes por zona horaria si solo viene la fecha
        const date = new Date(fechaISO.includes('T') ? fechaISO : `${fechaISO}T00:00:00`);
        return date.toLocaleDateString('es-AR'); 
    };

// FUNCIÓN ADAPTADA: Llama al endpoint y abre la URL firmada
    const verDocumento = async (path) => {
        try {
            // Pasamos el path como query parameter. Usamos encodeURIComponent por si la ruta tiene espacios o caracteres especiales.
            const res = await apiCall(`${API_URL}/api/documentos/obtener-url-documento?path=${encodeURIComponent(path)}`, {
                method: 'GET' // Aseguramos que sea un GET
            });
            
            // Dependiendo de tu apiCall, la respuesta puede venir anidada
            const data = res.data ? res.data : res;

            if (data && data.signedUrl) {
                // Abre la URL firmada en una nueva pestaña de forma segura
                window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
            } else {
                console.error("El servidor no devolvió una URL firmada válida.");
            }
        } catch (err) {
            console.error("Error al obtener el documento:", err);
            // Opcional: Podrías usar el estado `setError` aquí si quieres mostrar el fallo en la UI
            alert("No se pudo cargar el documento. Por favor, intenta nuevamente.");
        }
    };

    const eliminarVerificacion = async (v) => {
        // Confirmación del usuario
        if (window.confirm("¿Desea eliminar este certificado de verificación?")) {
            try {
                const queryParams = new URLSearchParams({ path: v.path }).toString();
                const url = `${API_URL}/api/documentos/verificacion/${v.id}?${queryParams}`;

                const res = await apiCall(url, {
                    method: 'DELETE',
                });
                
                if (onDelete) onDelete();

            } catch (err) {
                
                console.error("Error al eliminar:", err.message);
                
                alert(`No se pudo eliminar el documento: ${err.message || "Error de conexión"}`);
            }
        }
    }

    return (
        <div className="v-card">
            <div className="v-card-header">
                <h3 className="v-card-title">Historial de Verificaciones</h3>
            </div>
            
            <div className="v-card-content">
                {loading && <p className="v-state-text">Cargando historial...</p>}
                
                {error && <p className="v-state-text v-error">{error}</p>}
                
                {!loading && !error && verificaciones.length === 0 && (
                    <p className="v-state-text">Este instrumento aún no tiene verificaciones registradas.</p>
                )}

                {!loading && !error && verificaciones.length > 0 && (
                    <ul className="v-list">
                        {verificaciones.map((v) => (
                            <li key={v.id} className="v-item">
                                <div className="v-item-header">
                                    <span className="v-date">{formatearFecha(v.fecha_verificacion)}</span>
                                    <div style={{display:'flex', gap:'10px', alignItems: 'center'}}>
                                        {v.path && (
                                            <button 
                                                onClick={() => verDocumento(v.path)} 
                                                className="v-link"
                                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                Ver adjunto
                                            </button>
                                        )}
                                        <DropdownMenu
                                            isOpen={openDropdownId === v.id}
                                            onToggle={() => setOpenDropdownId(openDropdownId === v.id ? null : v.id)}
                                            items={[
                                                {
                                                    label:'Eliminar verificacion',
                                                    icon: 'delete',
                                                    color: 'red',
                                                    onClick: ()=>eliminarVerificacion(v)
                                                }
                                            ]}
                                        />
                                    </div>
                                </div>
                                {v.notas && <p className="v-notas">{v.notas}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}