import { useState } from "react";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import { ListadoProcesos } from "../components/ListadoProcesos";
import { useProcesos } from "../hooks/useProcesos";
import { Modal } from "../../../components/ui/Modal";
import { CrearProceso } from "../components/CrearProceso";
import { EditarProceso } from "../components/EditarProceso";
import { CrearRuta} from "../components/CrearRuta";

export function Procesos(){
    
    const [mostrarNewProceso, setMostrarNewProceso] = useState(false);
    const [mostrarEdicionProceso, setMostrarEdicionProceso] = useState(false);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);
    const [mostrarNewRutaProceso, setMostrarNewRutaProceso] = useState(false);

    const {
        procesos, 
        tipos,
        unidades,
        rutas, 
        loading, 
        loadingProcesos, 
        page, 
        totalPages,
        tipoSeleccionado, 
        setPage, 
        setTotalPages,
        setTipoSeleccionado, 
        refreshProcesos
    } = useProcesos();

    const editarProceso = (p)=>{
        setMostrarEdicionProceso(true);
        setProcesoSeleccionado(p);
    }

    const eliminarProceso = async (p)=>{
        return null;
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
                <div style={{width:'100%', textAlign:'start', marginBottom:'10px'}}>
                    <Button onClick={()=>setMostrarNewProceso(true)}>
                        Agregar proceso
                    </Button>
                </div>
                <ListadoProcesos 
                    procesos={procesos}
                    tipos={tipos}
                    unidades={unidades}
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                    loadingProcesos={loadingProcesos}
                    tipoSeleccionado={tipoSeleccionado}
                    setTipoSeleccionado={setTipoSeleccionado}
                    onEdit={(row)=>editarProceso(row)}
                    onDelete={(row)=>eliminarProceso(row)}
                />

                <div style={{width:'100%', textAlign:'start', marginBottom:'10px'}}>
                    <Button onClick={()=>setMostrarNewRutaProceso(true)}>
                        Nueva ruta de procesos
                    </Button>
                </div>
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
                        onSubmit={(ruta)=>console.log(ruta)}
                        onClose={()=>setMostrarNewRutaProceso(false)}
                        onReturn={null}
                    />
                </Modal>
            }
        </>
    )
}