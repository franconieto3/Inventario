import { useNavigate } from "react-router-dom";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import Can from "../../../components/Can";
import { TableroKanban } from "../components/TableroKanban";
import { ImpresionPedido } from "../components/ImpresionPedido";
import { useOrdenesActivas } from "../hooks/useOrdenesActivas";
import { useImprimirPedido } from "../hooks/useImprimirPedido";
import { useActualizarFechaEntrega } from "../hooks/useActualizarFechaEntrega";

import './DashboardProduccion.css'

export function DashboardProduccion(){

    const navigate = useNavigate();

    const {
        columnas,
        loadingOrdenes,
        actualizandoId,
        guardarOrdenProduccion,
        cancelarOrden,
        refreshOrdenes
    } = useOrdenesActivas();

    const { pedidoImprimir, solicitarImpresion } = useImprimirPedido();
    const { actualizarFechaEntrega, actualizandoId: actualizandoFechaId } = useActualizarFechaEntrega();

    const handleGuardarFechaEntrega = async (idPedido, fechaEntrega) => {
        const data = await actualizarFechaEntrega(idPedido, fechaEntrega);
        if (data) refreshOrdenes();
        return Boolean(data);
    };

    return (
        <>
            <NavBar/>
            <div className="body-container">

                <div className="supervision-tc" style={{marginBottom:'30px', flexWrap:'wrap'}}>
                    <div className="no-print">
                        <p className='supervision-titulos'>Supervisión de producción</p>
                    </div>
                    <div style={{display:'flex', gap:'10px',marginTop:'20px', alignItems:'center',flexWrap:'wrap'}}>
                        <ImpresionPedido pedido={pedidoImprimir} />
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
                        actualizandoId={actualizandoId}
                        onGuardarOrdenProduccion={guardarOrdenProduccion}
                        onCancelarOrden={cancelarOrden}
                        onImprimir={solicitarImpresion}
                        actualizandoFechaId={actualizandoFechaId}
                        onGuardarFechaEntrega={handleGuardarFechaEntrega}
                    />
                )}
            </div>
        </>
    )
}
