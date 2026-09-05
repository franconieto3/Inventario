import { useNavigate } from "react-router-dom";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import Can from "../../../components/Can";
import { TableroKanban } from "../components/TableroKanban";
import { ImpresionOrdenes } from "../components/ImpresionOrdenes";
import { useOrdenesActivas } from "../hooks/useOrdenesActivas";

import './DashboardProduccion.css'

export function DashboardProduccion(){

    const navigate = useNavigate();

    const {
        columnas,
        loadingOrdenes,
        actualizandoId,
        seleccionadas,
        ordenesSeleccionadas,
        toggleSeleccion,
        guardarOrdenProduccion,
        cancelarOrden
    } = useOrdenesActivas();

    return (
        <>
            <NavBar/>
            <div className="body-container">

                <div className="supervision-tc" style={{marginBottom:'30px', flexWrap:'wrap'}}>
                    <div className="no-print">
                        <p className='supervision-titulos'>Supervisión de producción</p>
                    </div>
                    <div style={{display:'flex', gap:'10px',marginTop:'20px', alignItems:'center',flexWrap:'wrap'}}>
                        <ImpresionOrdenes ordenesSeleccionadas={ordenesSeleccionadas} />
                        <Can permission='crear_ordenes_fabricacion'>
                            <div className="no-print">
                                <Button variant='default' onClick={()=>navigate('/supervision/generar-orden')}>
                                    Nuevo pedido de producción
                                </Button>
                            </div>
                        </Can>
                    </div>
                </div>

                {loadingOrdenes ? (
                    <p className="loading-state no-print">Cargando órdenes activas...</p>
                ) : (
                    <TableroKanban
                        columnas={columnas}
                        seleccionadas={seleccionadas}
                        actualizandoId={actualizandoId}
                        onToggleSeleccion={toggleSeleccion}
                        onGuardarOrdenProduccion={guardarOrdenProduccion}
                        onCancelarOrden={cancelarOrden}
                    />
                )}
            </div>
        </>
    )
}
