import { useEffect, useState, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';
import { usePartDetail } from './usePartDetail';
import { PartComponents } from './components/PartComponents';
import { PartHeader } from './components/PartHeader';
import { PartDocuments } from './components/PartDocuments';
import { PartMaterials } from './components/PartMaterials';
import { PartProcessRoutes } from './components/PartProcessRoutes';

import "./PartDetail.css"
import { PartInstruments } from './components/PartInstruments';
import Can from '../../../../components/Can';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartDetail({ idPieza, nombrePieza, codigoPieza, producto, onRefreshParent }) {
    const navigate = useNavigate(); 

    const {pieza, loading, fetchPart} = usePartDetail(idPieza);
    const [mostrar, setMostrar] = useState(false);

    useEffect(() => {
        if (mostrar && idPieza) {
            fetchPart();
        }
    }, [mostrar, idPieza, fetchPart]);

    return (
        <>
            <div className='detail'>

                <PartHeader
                    mostrar={mostrar} 
                    setMostrar={setMostrar}
                    idPieza={idPieza}
                    nombrePieza={nombrePieza}
                    codigoPieza={codigoPieza}
                    producto={producto}
                    onRefreshParent={onRefreshParent}
                    onPartUpdated={fetchPart}
                />
                {mostrar && (
                    <div className="pieza-info">
                        {loading && <p>Cargando...</p>}
                        
                        {!loading && pieza && (
                            <div style={{'display':'flex', 'gap':'15px', 'flexWrap':'wrap'}}>
                                <Can permission='ver_documentos'>
                                    {pieza.documentos && (
                                        <PartDocuments 
                                            documentos={pieza.documentos} 
                                            idPieza={idPieza} 
                                            onRefresh={fetchPart} 
                                        />
                                    )}
                                </Can>
                                <PartComponents
                                    pieza={pieza} 
                                    producto={producto} 
                                    onRefresh={fetchPart}
                                />
                                <Can permission='ver_materiales_pieza'>
                                    <PartMaterials
                                        pieza={pieza}
                                        producto={producto} 
                                        onRefresh={fetchPart}
                                    />
                                </Can>
                                <Can permission='ver_procesos_pieza'>
                                    <PartProcessRoutes
                                        pieza={pieza}
                                        onBopRemoval={fetchPart}
                                    />
                                </Can>
                                <Can permission='ver_instrumentos_pieza'>
                                <PartInstruments
                                    pieza={pieza}
                                    onRefresh={fetchPart}
                                />
                                </Can>
                                
                            </div>
                        )}
                    </div>
                )}
                
            </div>
        </>
    );
}