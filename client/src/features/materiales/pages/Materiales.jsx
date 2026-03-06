import NavBar from "../../../components/layout/NavBar";
import { ListadoMateriales } from "../components/ListadoMateriales";
import { MaterialForm } from "../components/MaterialForms";
import { useMateriales } from "../hooks/useMateriales";

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
        addMaterial 
    } = useMateriales()


    return(
        <>
            <NavBar/>
            <div className="body-container">
              <MaterialForm rubros={rubros} unidades={unidades} onSubmit={()=>console.log("Enviando información")}/>  
              <ListadoMateriales/>
            </div>
        </>
    );
}