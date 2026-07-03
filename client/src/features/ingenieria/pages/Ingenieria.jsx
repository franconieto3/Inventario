import NavBar from "../../../components/layout/NavBar";
import { ListadoSolicitudesAcceso } from "../components/ListadoSolicitudesAcceso";
import Solapador from "../../../components/layout/Solapador";
import { ListadoSolicitudesCambio } from "../components/ListadoSolicitudesCambio";

//Estilos
import "./Ingenieria.css"

export function Ingenieria(){

    return(
        <>
            <NavBar />
            <div className="body-container">
              <div className="ingenieria-tc">
                <p className='ingenieria-titulos'>Ingeniería</p>
              </div>
              <Solapador>
                <div titulo="Solicitudes de cambios">
                  <ListadoSolicitudesCambio/>
                </div>
                <div titulo="Solicitudes de acceso">
                  <ListadoSolicitudesAcceso/>
                </div>
              </Solapador>

            </div>
        </>

    );
}