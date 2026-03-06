import { useState } from "react";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import { ListadoMateriales } from "../components/ListadoMateriales";
import { MaterialForm } from "../components/MaterialForms";
import { useMateriales } from "../hooks/useMateriales";
import { Modal } from "../../../components/ui/Modal";
import { EditarMaterial } from "../components/EditarMaterial";

export function Materiales(){
    const {
        rubros,
        unidades,
        materiales,
        loading,
        loadingMaterials,
        totalPages,
        page,
        setPage,
        setRubroSeleccionado,
        addMaterial,
        refreshMaterials 
    } = useMateriales()

    const [mostrarNewMaterial, setMostrarNewMaterial] = useState(false);
    const [mostrarEdicionMaterial, setMostrarEdicionMaterial]= useState(false);
    const [materialSeleccionado, setMaterialSeleccionado] = useState(null);

    const eliminarMaterial = async(m)=>{
        console.log("Eliminando material", m);
    }

    const editarMaterial = async(m)=>{
        setMostrarEdicionMaterial(true);
        setMaterialSeleccionado(m);
    }

    return(
        <>
            <NavBar/>
            <div className="body-container">
                <div className='title-container'>
                    <div>
                        <p className='products-text'>Materiales</p>
                    </div>
                </div>
                <div style={{width:'100%', textAlign:'start', marginBottom:'10px'}}>
                    <Button onClick={()=>setMostrarNewMaterial(true)}>
                        Agregar material
                    </Button>
                </div>  
                <ListadoMateriales 
                    rubros={rubros} 
                    materiales={materiales} 
                    loadingMaterials={loadingMaterials} 
                    totalPages={totalPages} 
                    page={page}
                    setPage={setPage} 
                    setRubroSeleccionado={setRubroSeleccionado} 
                    onEdit={(m)=>editarMaterial(m)}
                    onDelete={(m)=>eliminarMaterial(m)}
                />
            </div>
            {
                mostrarNewMaterial &&
                <Modal titulo={"Agregar nuevo material"} descripcion={null} onClose={()=>setMostrarNewMaterial(false)}>
                    <MaterialForm rubros={rubros} unidades={unidades} onSubmit={()=>refreshMaterials()} onClose={()=>setMostrarNewMaterial(false)}/>
                </Modal>
            }
            {
                mostrarEdicionMaterial &&
                <Modal titulo="Editar material" descripcion={materialSeleccionado.descripcion} onClose={()=>setMostrarEdicionMaterial(false)}>
                    <EditarMaterial                     
                        material={materialSeleccionado} 
                        rubros={rubros} 
                        unidades={unidades} 
                        onSubmit={() => refreshMaterials()} 
                        onClose={() => setMostrarEdicionMaterial(false)}
                    />
                </Modal>

            }
        </>
    );
}