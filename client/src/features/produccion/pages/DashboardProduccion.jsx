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
        guardarOrdenProduccion
    } = useOrdenesActivas();

    return (
        <>
            <NavBar/>
            <div className="body-container">

                <div className="supervision-tc no-print" style={{marginBottom:'30px'}}>
                    <div>
                        <p className='supervision-titulos'>Supervisión de producción</p>
                    </div>
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        <ImpresionOrdenes ordenesSeleccionadas={ordenesSeleccionadas} />
                        <Can permission='crear_ordenes_fabricacion'>
                            <Button variant='default' onClick={()=>navigate('/supervision/generar-orden')}>
                                Nuevo pedido de producción
                            </Button>
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
                    />
                )}
            </div>
        </>
    )
}
