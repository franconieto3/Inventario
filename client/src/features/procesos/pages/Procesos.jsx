import { useState } from "react";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import { ListadoProcesos } from "../components/ListadoProcesos";
import { useProcesos } from "../hooks/useProcesos";
import { Modal } from "../../../components/ui/Modal";
import { CrearProceso } from "../components/CrearProceso";
import { EditarProceso } from "../components/EditarProceso";
import  {ListadoRutasFabricacion} from "../components/ListadoRutasFabricacion";
import { apiCall } from "../../../services/api";
import Solapador from "../../../components/layout/Solapador";
import Can from "../../../components/Can";
import { useProcessGraphs } from "../hooks/useProcessGraphs";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function Procesos(){
    
    const [mostrarNewProceso, setMostrarNewProceso] = useState(false);
    const [mostrarEdicionProceso, setMostrarEdicionProceso] = useState(false);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);

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
        grafos,
        tipos,
        page,
        setPage,
        totalPages,
        tipoSeleccionado,
        setTipoSeleccionado,
        refreshRutas,
        loadingRoutes
    } = useProcessGraphs();

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

    return(
        <>
            <NavBar/>
            <div className="body-container">
                <div className='title-container'>
                    <div>
                        <p className='products-text'>Procesos</p>
                    </div>
                </div>
                <Solapador>
                    <div titulo="Procesos" style={{marginBottom:'50px'}}>
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
                    <div titulo="Rutas de fabricación">
                        <ListadoRutasFabricacion
                            rutas={grafos}
                            tipos={tipos}
                            page={page}
                            totalPages={totalPages}
                            setPage={setPage}
                            tipoSeleccionado={tipoSeleccionado}
                            setTipoSeleccionado={setTipoSeleccionado}
                            refreshRutas={refreshRutas}
                        />
                    </div>
                </Solapador>
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
        </>
    )
}