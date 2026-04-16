import { useState } from "react";

import Table from "../../../components/ui/Table";
import {Modal} from "../../../components/ui/Modal";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { useAccessRequests } from "../hooks/useAccessRequests";
import { ActualizarSolicitud } from "./ActualizarSolicitud";


// Sub-componente para manejar el estado individual del Dropdown por fila
const AccessRequestRowActions = ({ row, onEditClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleMenu = () => setIsOpen(!isOpen);
    

    const menuItems = [
        {
            label: "Responder",
            icon: "edit",
            onClick: () => {
                onEditClick(row);
            }
        }
    ];

    return (
        <DropdownMenu 
            isOpen={isOpen} 
            onToggle={toggleMenu} 
            items={menuItems} 
        />
    );
};

export function ListadoSolicitudesAcceso() {
    const {
        solicitudes,
        estados,
        loadingRequests,
        page,
        totalPages,
        selectedStatus,
        setPage,
        setSelectedStatus,
        refreshRequests
    } = useAccessRequests();
    
    // Paginación
    const handlePrevPage = () => setPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setPage(prev => Math.min(totalPages, prev + 1));
    
    const [mostrarEdicion, setMostrarEdicion] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    const handleEditClick = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setMostrarEdicion(true);
    };

    const handleVerPlano = async (idVersion) => {
       window.open(`/documento/${idVersion}`, '_blank');
    };

    const columnas = [
        {
            key: "id_version",
            header: "Documento Afectado",
            render: (_) =>(
                <div style={{'display':'flex','alignItems':'center','gap':'5px','cursor':'pointer'}} onClick={()=>handleVerPlano(_)}>
                    <i className="material-icons">open_in_new</i>
                    <span> Ver documento</span>
                </div>
            )
        },
        {
            key: "nombre_solicitante",
            header: "Solicitado por",
            render: (_) => _ || "---"
        },
        {
            key: "estado",
            header: "Estado",
            render: (status) => {
                if (!status) return "---";
                const STATUS_STYLES = {
                    pendiente: { backgroundColor: '#fef3c7', color: '#92400e' },
                    aprobada:  { backgroundColor: '#dcfce7', color: '#166534' },
                    rechazada: { backgroundColor: '#fee2e2', color: '#991b1b' } 
                };

                const key = String(status).toLowerCase();
                const styles = STATUS_STYLES[key] ?? { backgroundColor: '#e5e7eb', color: '#374151' };

                return (
                    <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        ...styles
                    }}>
                        {String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase()}
                    </span>
                );
            }
        },
        {
            key: "nombre_aprobador",
            header: "Responsable",
            render: (_) => _ || "---"
        },
        {
            key: "hora_inicio",
            header: "Hora de inicio",
            render: (_) => _ || "---"
        },
        {
            key: "hora_fin",
            header: "Hora de fin",
            render: (_) => _ || "---"
        },
        {
            key: "fecha_vencimiento",
            header: "Vencimiento",
            render: (_) => _ ? new Date(_).toLocaleDateString() : "---"
        },
        {
            key: "acciones",
            header: "",
            render: (_, row) => row.estado === 'PENDIENTE' ? (
                <AccessRequestRowActions 
                    row={row} 
                    onEditClick={handleEditClick} 
                />
            ) : null
        }
    ];

    return (
        <>
            <div style={{marginTop:'40px'}}>
                <div style={{ display: 'flex', textAlign: 'start', alignItems: 'center', width: '100%', marginBottom: '20px', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontWeight: '500' }}>Solicitudes de Acceso a Documentos</h3>
                        <p className="table-description">
                            Gestión y aprobación de permisos temporales para visualización de documentos.
                        </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'start' }}>
                        <select 
                            value={selectedStatus} 
                            onChange={(e) => { 
                                setPage(1); // Resetear a pag. 1 al cambiar filtro
                                setSelectedStatus(e.target.value);
                            }}
                        >
                            {estados.map((estado) => (
                                <option key={estado.id} value={estado.id}>
                                    {estado.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <Table data={solicitudes} columns={columnas} />

                {totalPages > 1 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                        <button 
                            onClick={handlePrevPage} 
                            disabled={page === 1 || loadingRequests}
                            className="pagination-button"
                        >
                            <i className="material-icons">chevron_left</i>
                        </button>
                        <span>{page} / {totalPages}</span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={page === totalPages || loadingRequests}
                            className="pagination-button"
                        >
                            <i className="material-icons">chevron_right</i>
                        </button>
                    </div>
                )}

                {mostrarEdicion && solicitudSeleccionada && (
                    <Modal
                        titulo={`Responder Solicitud #${solicitudSeleccionada.id_solicitud}`}
                        descripcion="Seleccione un horario de inicio, fin y fecha de vencimiento"
                        onClose={() => {
                            setMostrarEdicion(false);
                            setSolicitudSeleccionada(null);
                        }}
                    >
                        <ActualizarSolicitud 
                            solicitud={solicitudSeleccionada}
                            onClose={() => {
                                setMostrarEdicion(false);
                                setSolicitudSeleccionada(null);
                            }}
                            onSuccess={() => {
                                // Llamamos al refresh de tu custom hook para recargar la tabla
                                refreshRequests();
                            }}
                        />
                    </Modal>
                )}
            </div>
        </>
    );
}