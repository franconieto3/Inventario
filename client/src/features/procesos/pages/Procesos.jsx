import { useState } from "react";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import { ListadoProcesos } from "../components/ListadoProcesos";
import { useProcesos } from "../hooks/useProcesos";
import { Modal } from "../../../components/ui/Modal";
import { CrearProceso } from "../components/CrearProceso";
import { EditarProceso } from "../components/EditarProceso";

export function Procesos(){
    
    const [mostrarNewProceso, setMostrarNewProceso] = useState(false);
    const [mostrarEdicionProceso, setMostrarEdicionProceso] = useState(false);
    const [procesoSeleccionado, setProcesoSeleccionado] = useState(null);

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
                  
            </div>
            {mostrarNewProceso &&
                <Modal
                    titulo="Agregar nuevo proceso"
                    descripcion={null}
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
        </>
    )
}