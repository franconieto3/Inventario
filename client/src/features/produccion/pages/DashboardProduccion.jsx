import { useNavigate } from "react-router-dom";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import Solapador from "../../../components/layout/Solapador";

import './DashboardProduccion.css'
import Can from "../../../components/Can";

export function DashboardProduccion(){

    const navigate = useNavigate();

    return (
        <>
            <NavBar/>
            <div className="body-container">

                <div style={{display:'flex', alignItems:'center', justifyContent: 'space-between', marginBottom:'30px'}}>
                    <div className="supervision-tc">
                        <p className='supervision-titulos'>Supervisión de producción</p>
                    </div>
                    <Can permission='crear_ordenes_fabricacion'>
                        <Button variant='default' onClick={()=>navigate('/supervision/generar-orden')}>
                            Nuevo pedido de producción
                        </Button>
                    </Can>
                </div>

                <Solapador>
                    <div titulo="Validación de diseño">
                    </div>
                    <div titulo="Validación de materiales">
                    </div>
                    <div titulo="En producción">
                    </div>
                    <div titulo="Realizado">
                    </div>
                </Solapador>
            </div>
        </>
    )
}