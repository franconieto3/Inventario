import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Table from "../../../components/ui/Table";
import { useMateriales } from "../hooks/useMateriales";

export function ListadoMateriales(){

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

    const columnas = [
        {
            key:"descripcion",
            header:"Descripcion"
        },
        {
            key: "id_rubro_material",
            header: "Rubro"
        },
       {
            key: "es_trazable",
            header: "Trazable",
            render: (_)=> _ ? "Sí" : "No"
        },
        {
            key: "id_unidad_medida",
            header: "Criterio de medición"
        },
        {
            key:"",
            header: "",
            render: (_,row)=>(<DropdownMenu/>)
        }
    ]

    return(
        <>
        <Table data={materiales} columns={columnas}/>
        </>
    );
}