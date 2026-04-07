import { useState } from "react";
import { apiCall } from "../../../../../services/api";
import { DropdownMenu } from "../../../../../components/ui/DropdownMenu";
import { HistorialVersiones } from "../../HistorialVersiones";
import { SolicitudCambio } from "../../SolicitudCambio";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartDocuments({ documentos, idPieza, onRefresh }) {
    const navigate = useNavigate();

    const [activeMenuId, setActiveMenuId] = useState(null);
    
    // Estados para modales
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [mostrarSolicitud, setMostrarSolicitud] = useState(false);
    
    // Estados de selección corregidos y separados
    const [tipoDocSeleccionado, setTipoDocSeleccionado] = useState(null);
    const [versionSeleccionada, setVersionSeleccionada] = useState(null);

    const toggleMenu = (id) => setActiveMenuId(activeMenuId === id ? null : id);

    const handleVerPlano = async (idVersion, pathArchivo) => {
        /*
        try {
            const params = new URLSearchParams({ path: pathArchivo });
            const { signedUrl } = await apiCall(`${API_URL}/api/documentos/obtener-url-documento?${params.toString()}`, { method: 'GET' });
            window.open(signedUrl, '_blank');
        } catch (err) {
            alert(err.message);
        }*/
       window.open(`/documento/${idVersion}`, '_blank');
       
    };

    const handleEliminarVersion = async (idDocumento) => {
        if (window.confirm("¿Desea eliminar este documento?")) {
            try {
                await apiCall(`${API_URL}/api/documentos/eliminar/${idDocumento}`, { method: 'DELETE' });
                onRefresh();
                setActiveMenuId(null);
            } catch (err) {
                alert(err.message);
            }
        }
    };

    return (
        <div className='detalle-documentos'>
            <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className='material-icons'>file_open</i> Documentos: 
            </p>
            
            <div>
                {documentos.map((d) => (
                    <div key={d.id_tipo_documento} className='display-documento'>
                        <div style={{ cursor: 'pointer' }} onClick={() => handleVerPlano(d.id_version, d.path)}>
                            <i className='material-icons'>open_in_new</i>
                            <span style={{ color: 'blue', textDecoration: 'underline', marginLeft: '5px' }}>
                                Ver {d.descripcion}
                            </span>
                        </div>
                        <div>
                            <DropdownMenu 
                                isOpen={activeMenuId === d.id_tipo_documento}
                                onToggle={() => toggleMenu(d.id_tipo_documento)}
                                items={[
                                    {
                                        label: 'Solicitar una modificación',
                                        icon: 'edit',
                                        onClick: () => {
                                            setVersionSeleccionada(d.id_version);
                                            setMostrarSolicitud(true);
                                        }
                                    },
                                    {
                                        label: 'Historial de versiones',
                                        icon: 'history',
                                        onClick: () => {
                                            setTipoDocSeleccionado(d.id_tipo_documento);
                                            setMostrarHistorial(true);
                                        }
                                    },
                                    {
                                        label: 'Eliminar versión',
                                        icon: 'delete',
                                        color: 'red',
                                        onClick: () => handleEliminarVersion(d.id_version),
                                        permission: "administrar_documentos"
                                    }
                                ]}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modales asilados */}
            {mostrarHistorial && (
                <HistorialVersiones 
                    idPieza={idPieza} 
                    idTipoDocumento={tipoDocSeleccionado} 
                    closeHistoryModal={() => { setMostrarHistorial(false); setTipoDocSeleccionado(null); }} 
                    verDocumento={handleVerPlano}
                />
            )}  

            {mostrarSolicitud && (
                <SolicitudCambio 
                    idVersion={versionSeleccionada} 
                    onClose={() => { setMostrarSolicitud(false); setVersionSeleccionada(null); }}
                />
            )}
        </div>
    );
}