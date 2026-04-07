import { useState } from "react";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import { ListadoProcesos } from "../components/ListadoProcesos";
import { useProcesos } from "../hooks/useProcesos";
import { Modal } from "../../../components/ui/Modal";
import { CrearProceso } from "../components/CrearProceso";
import { EditarProceso } from "../components/EditarProceso";
import { CrearRuta} from "../components/CrearRuta";
import { ListadoRutas } from "../components/ListadoRutas";
import { useProcessRoutes } from "../hooks/useProcessRoutes";
import { EditarRuta } from "../components/EditarRuta";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function Procesos(){
    
    const [mostrarNewProceso, setMostrarNewProceso] = useState(false);
    const [mostrarEdicionProceso, setMostrarEdicionProceso] = useState(false);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);

    const [mostrarNewRutaProceso, setMostrarNewRutaProceso] = useState(false);
    const [mostrarEdicionRuta, setMostrarEdicionRuta] = useState(false);
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

    const {
        procesos,
        unidades,
        loading, 
        loadingProcesos, 
        page: pageProcesos, 
        totalPages: totalPagesProcesos,
        setPage: setPageProcesos, 
        refreshProcesos
    } = useProcesos();

    const {
        rutas,
        tipos,
        page: pageRutas,
        totalPages: totalPagesRutas,
        setPage: setPageRutas,
        tipoSeleccionado,
        setTipoSeleccionado,
        refreshRutas,
        crearRuta,
        loadingRoutes
    }= useProcessRoutes();

    const editarProceso = (p)=>{
        setProcesoSeleccionado(p);
        setMostrarEdicionProceso(true);
    }

    const eliminarProceso = async (p)=>{
        if(window.confirm(`¿Desea eliminar el proceso ${p.nombre}? Esto afectara a todas las rutas asociadas`)){
            try{
                const res = await apiCall(`${API_URL}/api/procesos/delete/${p.id_proceso}`,{method:'DELETE'});
                refreshProcesos();
            }catch(err){
                console.error(err.message);
            }
        }
    }

    const editarRuta = (r)=>{
        setRutaSeleccionada(r);
        setMostrarEdicionRuta(true);
    }

    const eliminarRuta = async (r)=>{
        if(window.confirm(`¿Desea eliminar la ruta ${r.nombre}? Esto afectara a todas las piezas asociadas a esta ruta`)){
            console.log("Eliminando ruta... ", r.id_bop);
            try{
                const res = await apiCall(`${API_URL}/api/procesos/ruta/delete/${r.id_bop}`,{method:'DELETE'});
                refreshRutas();
            }catch(err){
                console.error(err.message);
            }
        }
    }

    return(
        <>
            <NavBar/>
            <div className="body-container">
                <div className='title-container'>
                    <div>
                        <p className='products-text'>Procesos</p>
                    </div>
                </div>
                <div style={{marginBottom:'50px'}}>
                    <ListadoProcesos 
                        procesos={procesos}
                        unidades={unidades}
                        page={pageProcesos}
                        setPage={setPageProcesos}
                        totalPages={totalPagesProcesos}
                        loadingProcesos={loadingProcesos}
                        tipoSeleccionado={tipoSeleccionado}
                        setTipoSeleccionado={setTipoSeleccionado}
                        onEdit={(row)=>editarProceso(row)}
                        onDelete={(row)=>eliminarProceso(row)}
                        onNewProcess={()=>setMostrarNewProceso(true)}
                    />
                </div>
                
                <ListadoRutas
                    rutas={rutas}
                    tipos={tipos}
                    page={pageRutas}
                    totalPages={totalPagesRutas}
                    setPage={setPageRutas}
                    tipoSeleccionado={tipoSeleccionado}
                    setTipoSeleccionado={setTipoSeleccionado}
                    refreshRutas={refreshRutas} 
                    onEdit={(item)=>editarRuta(item)}
                    onDelete={(item)=>eliminarRuta(item)}
                    onNewRoute={()=>setMostrarNewRutaProceso(true)}
                />
            </div>
            {mostrarNewProceso &&
                <Modal
                    titulo="Agregar nuevo proceso"
                    descripcion="Completa los datos para registrar un proceso en el sistema."
                    onClose={()=>setMostrarNewProceso(false)}
                >
                    <CrearProceso
                        onClose={()=>setMostrarNewProceso(false)}
                        onSuccess={refreshProcesos}
                    />
                </Modal>
            }
            {mostrarEdicionProceso &&
                <Modal
                    titulo="Editar proceso"
                    descripcion={procesoSeleccionado.nombre}
                    onClose={()=>setMostrarEdicionProceso(false)}
                >
                    <EditarProceso
                        proceso={procesoSeleccionado}
                        onClose={()=>setMostrarEdicionProceso(false)}
                        onSuccess={refreshProcesos}
                    />
                </Modal>
            }
            {mostrarNewRutaProceso &&
                <Modal
                    titulo="Nueva ruta de procesos"
                    descripcion="Seleccione los procesos y arrastrelos para definir el orden"
                    onClose={()=>setMostrarNewRutaProceso(false)}
                >
                    <CrearRuta 
                        tipos={tipos}
                        onSubmit={crearRuta}
                        onClose={()=>setMostrarNewRutaProceso(false)}
                        onReturn={null}
                    />
                </Modal>
            }
            {mostrarEdicionRuta &&
                <Modal
                    titulo="Editar ruta de procesos"
                    descripcion={`Ruta seleccionada: ${rutaSeleccionada.nombre}`}
                    onClose={()=>setMostrarEdicionRuta(false)}
                >
                    <EditarRuta
                        rutaEdit={rutaSeleccionada}
                        onSubmit={refreshRutas}
                        onReturn={null}
                        onClose={()=>setMostrarEdicionRuta(false)}
                    />
                </Modal>
            }
        </>
    )
}