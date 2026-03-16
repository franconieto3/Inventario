import { useState } from "react";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import { ListadoProcesos } from "../components/ListadoProcesos";
import { useProcesos } from "../hooks/useProcesos";

export function Procesos(){
    
    const [mostrarNewProceso, setMostrarNewProceso] = useState(false);
    const {procesos, rutas} = useProcesos();
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
                    onEdit={(row)=>console.log(row)}
                    onDelete={(row)=>console.log(row)}
                />
                  
            </div>
        </>
    )
}