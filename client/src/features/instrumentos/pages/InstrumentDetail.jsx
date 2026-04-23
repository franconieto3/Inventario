import { useCallback, useEffect, useState } from "react";
import NavBar from "../../../components/layout/NavBar";
import {DropdownMenu} from "../../../components/ui/DropdownMenu";
import { apiCall } from "../../../services/api";
import { useParams } from "react-router-dom";
import { EditarInstrumentos } from "../components/EditarInstrumentos";

import './instrumentDetail.css'
import { Modal } from "../../../components/ui/Modal";
import { useInstruments } from "../hooks/useInstruments";
import { AgregarArchivo } from "../components/AgregarArchivo";
import { AgregarVerificacion } from "../components/AgregarVerificacion";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const DetailItem = ({ label, value }) => (
    <div className="detail-item">
        <span className="detail-label">{label}: </span>
        <span className="detail-value">{value !== null && value !== undefined ? value : '-'}</span>
    </div>
);

export function InstrumentDetail(){

    const { id } = useParams();

    const [instrumento, setInstrumento] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    //Estado de DropdownMenu
    const [activeMenu, setActiveMenu] = useState(false)
    
    //Edición
    const [mostrarEdicion, setMostrarEdicion] = useState(false);
    const [params, setParams] = useState({ 
        page: 1, 
        limit: 10, 
        tipo: '', 
        sectorId: '' ,
        estado: ''
    });
    const {enums} = useInstruments(params);

    //Agregar archivos
    const [mostrarAgregarArchivos, setMostrarAgregarArchivos] = useState(false);

    //Agregar verificación
    const [mostrarAgregarVerificacion, setMostrarAgregarVerificacion] = useState(false);

    const fetchInstrument = useCallback(async ()=>{
        setError("");
        try{
            setLoading(true);
            const res = await apiCall(`${API_URL}/api/instrumentos/detalle/${id}`, {});
            setInstrumento(res);

        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    },[id])

    useEffect(()=>{
        fetchInstrument()
    },[fetchInstrument, refreshTrigger])

    
    return (
        <>
            <NavBar />
            <div className="body-container">
                {loading && (
                    <div className="loading-state">
                        <p>Cargando detalles del instrumento...</p>
                    </div>
                )}
                
                {error && (
                    <div className="error-state">
                        <p>Error al cargar: {error}</p>
                    </div>
                )}

                {!loading && !error && instrumento && (
                    <div className="icard">
                        <div className="icard-header">
                            <div>
                                <h2 className="icard-title">Detalle de Instrumento</h2>
                                <p className="icard-description">Información técnica y estado de calibración</p>
                            </div>
                            <div style={{display: 'flex', alignItems:'center', gap: '5px'}}>
                                <span className="badge">{instrumento.tipo}</span>
                                <DropdownMenu
                                    isOpen={activeMenu}
                                    onToggle={()=>setActiveMenu(!activeMenu)}
                                    items={[
                                        {
                                            label: 'Editar',
                                            icon: 'edit',
                                            onClick: ()=>setMostrarEdicion(true)
                                        },
                                        {
                                            label: 'Agregar archivo',
                                            icon: 'upload',
                                            onClick: ()=>setMostrarAgregarArchivos(true)
                                        },
                                        {
                                            label: 'Agregar verificación',
                                            icon: 'check',
                                            onClick: ()=> setMostrarAgregarVerificacion(true)
                                        },
                                        {
                                            label: 'Dar de baja',
                                            icon: 'cancel',
                                            color: 'red',
                                            onClick: ()=>console.log('Dando de baja...')
                                        }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="icard-content">
                            <DetailItem label="Descripción" value={instrumento.descripcion} />
                            <DetailItem label="Marca" value={instrumento.marca} />
                            <DetailItem label="Modelo" value={instrumento.modelo} />
                            <DetailItem label="Nro. Serie" value={instrumento.nro_serie} />
                            <DetailItem label="Sector" value={instrumento.sector} />
                            <DetailItem label="Proveedor" value={instrumento.tipo_proveedor} />

                            {/* Lógica condicional según el tipo de instrumento */}
                            {instrumento.tipo === 'ESTANDAR' && (
                                <>
                                    <DetailItem label="Frecuencia de Calibración" value={`${instrumento.frecuencia_meses} meses`} />
                                    <DetailItem label="Mes de Vencimiento" value={instrumento.mes_vencimiento} />
                                </>
                            )}

                            {instrumento.tipo === 'PROBADOR' && (
                                <>
                                    <DetailItem label="Usos Actuales" value={instrumento.usos_actuales} />
                                    <DetailItem label="Usos Máximos Permitidos" value={instrumento.usos_maximos} />
                                </>
                            )}
                        </div>
                    </div>
                )}
                {mostrarEdicion && instrumento &&
                    <Modal
                        titulo="Modificar instrumento"
                        descripcion=""
                        onClose={()=>setMostrarEdicion(false)}
                    >
                        <EditarInstrumentos
                            instrumento={instrumento}
                            onClose={()=>setMostrarEdicion(false)}
                            onSuccess={()=>setRefreshTrigger(refreshTrigger+1)}
                            enums={enums}
                        />
                    </Modal>
                }
                {mostrarAgregarArchivos &&
                    <Modal
                        titulo="Adjuntar archivos"
                        descripcion="Agregar imágenes, manuales, instructivos, etc"
                        onClose={()=>setMostrarAgregarArchivos(false)}
                    >
                        <AgregarArchivo></AgregarArchivo>
                    </Modal>
                }
                {mostrarAgregarVerificacion &&
                    <Modal
                        titulo="Nueva verificación"
                        descripcion=""
                        onClose={()=>setMostrarAgregarVerificacion(false)}
                    >
                        <AgregarVerificacion
                            onSuccess={
                                ()=>{
                                    setMostrarAgregarVerificacion(false);
                                    setRefreshTrigger(refreshTrigger+1);
                                }
                            }
                            idInstrumento={id}
                        />
                    </Modal>
                }
            </div>
        </>
    );
}