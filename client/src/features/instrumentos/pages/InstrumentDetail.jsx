import { useEffect, useState } from "react";
import NavBar from "../../../components/layout/NavBar";
import { apiCall } from "../../../services/api";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const DetailItem = ({ label, value }) => (
    <div className="detail-item">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{value !== null && value !== undefined ? value : '-'}</span>
    </div>
);

export function InstrumentDetail(){

    const { id } = useParams();

    const [instrumento, setInstrumento] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(()=>{
        const fetchInstrument = async ()=>{
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
        }
        fetchInstrument()
    },[])

    
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
                    <div className="card">
                        <div className="card-header">
                            <div>
                                <h2 className="card-title">Detalle de Instrumento</h2>
                                <p className="card-description">Información técnica y estado de calibración</p>
                            </div>
                            <span className="badge">{instrumento.tipo}</span>
                        </div>

                        <div className="card-content">
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

            </div>
        </>
    );
}