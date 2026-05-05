import { useState, useEffect, useCallback } from "react";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { apiCall } from "../../../services/api";


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function ArchivosInstrumentos( {idInstrumento, refreshTrigger, onDelete} ){

    const [archivos, setArchivos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const fetchArchivos = useCallback(async () => {
        setError('');
        try {
            setLoading(true);
            // Llamada al endpoint creado en el paso anterior
            const res = await apiCall(`${API_URL}/api/instrumentos/${idInstrumento}/archivos`);

            const datos = res.data ? res.data : res;
            setArchivos(Array.isArray(datos) ? datos : []);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [idInstrumento]);

    useEffect(() => {
        if (idInstrumento) {
            fetchArchivos();
        }
    }, [fetchArchivos, refreshTrigger]);

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

    const eliminarArchivo = async (a) => {
        // Confirmación del usuario
        if (window.confirm("¿Desea eliminar este archivo?")) {
            try {
                const queryParams = new URLSearchParams({ path: a.path }).toString();
                const url = `${API_URL}/api/documentos/archivo-auxiliar/${a.id}?${queryParams}`;

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
                <h3 className="v-card-title">Archivos asociados al elemento</h3>
            </div>
            
            <div className="v-card-content">
                {loading && <p className="v-state-text">Cargando archivos...</p>}
                
                {error && <p className="v-state-text v-error">{error}</p>}
                
                {!loading && !error && archivos.length === 0 && (
                    <p className="v-state-text">Este instrumento aún no tiene archivos adjuntos.</p>
                )}

                {!loading && !error && archivos.length > 0 && (
                    <ul className="v-list">
                        {archivos.map((a) => (
                            <li key={a.id} className="v-item">
                                <div className="v-item-header">
                                    <span className="v-date">{a.tipo_documento}</span>
                                    <div style={{display:'flex', gap:'10px', alignItems: 'center'}}>
                                        {a.path && (
                                            <button 
                                                onClick={() => verDocumento(a.path)} 
                                                className="v-link"
                                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                Ver adjunto
                                            </button>
                                        )}
                                        <DropdownMenu
                                            isOpen={openDropdownId === a.id}
                                            onToggle={() => setOpenDropdownId(openDropdownId === a.id ? null : a.id)}
                                            items={[
                                                {
                                                    label:'Eliminar archivo',
                                                    icon: 'delete',
                                                    color: 'red',
                                                    onClick: ()=>eliminarArchivo(a)
                                                }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}