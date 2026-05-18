import { SearchSelector } from "../../../components/ui/SearchSelector";

export function AdministrarSectores({sectores, usuario, onSuccess, onClose}){
    return(
        <>
            <div className="modal-content">
                <SearchSelector
                    opciones={sectores}
                    placeholder="Buscar sectores.."
                    keys={["id_sector", "descripcion"]}
                    idField="id_sector"
                    displayField="descripcion"
                    onSelectionChange={(lista)=>{console.log(lista)}}
                >

                </SearchSelector>
            </div>
        </>
    )
}