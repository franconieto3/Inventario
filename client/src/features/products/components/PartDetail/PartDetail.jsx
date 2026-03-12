import { useEffect, useState, useCallback } from 'react';

//import { apiCall } from '../../../../services/api';
//import { DropdownMenu } from '../../../../components/ui/DropdownMenu';
//import formatearCodigo from '../../../../services/formatearCodigo';
//import EdicionPieza from '../EdicionPieza';
//import { HistorialVersiones } from '../HistorialVersiones';
//import Can from '../../../../components/Can';
//import { SolicitudCambio } from '../SolicitudCambio';

import "./PartDetail.css"

//import { AgregarComponentes } from '../../../ensambles/components/AgregarComponentes';
//import Button from '../../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
//import { EditarComponente } from '../../../ensambles/components/EditarComponentes';
import { usePartDetail } from './usePartDetail';
import { PartComponents } from './components/PartComponents';
import { PartHeader } from './components/PartHeader';
import { PartDocuments } from './components/PartDocuments';
import { PartMaterials } from './components/PartMaterials';
import { PartProcessRoutes } from './components/PartProcessRoutes';

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

                                {pieza.documentos && (
                                    <PartDocuments 
                                        documentos={pieza.documentos} 
                                        idPieza={idPieza} 
                                        onRefresh={fetchPart} 
                                    />
                                )}

                                <PartComponents
                                    pieza={pieza} 
                                    producto={producto} 
                                    onRefresh={fetchPart}
                                />
                                <PartMaterials
                                    pieza={pieza}
                                    producto={producto} 
                                    onRefresh={fetchPart}
                                />
                                <PartProcessRoutes
                                    pieza={pieza}
                                />
                                <div className='detalle-documentos'>
                                    <p style={{'display':'flex', 'alignItems':'center','gap':'5px'}}>
                                        <i className='material-icons'>straighten</i>    
                                        Elementos de control: 
                                    </p>
                                </div>
                                
                            </div>
                        )}
                    </div>
                )}
                
            </div>
        </>
    );
}