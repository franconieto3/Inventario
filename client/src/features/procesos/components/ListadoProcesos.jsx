import { useState } from "react";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Table from "../../../components/ui/Table";

export function ListadoProcesos({
    procesos,
    onEdit,
    onDelete 
}){
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const columnas = [
        {
            key:"nombre",
            header:"Nombre"
        },
        {
            key:"objeto_proceso",
            header:"Tipo de proceso"
        },
        {
            key: "unidad_medicion",
            header: "Intervalo de medición"
        },
        {
            key: "",
            header: "Acciones",
            render: (_, row) =>
                (<DropdownMenu
                    isOpen={openDropdownId === row.id_proceso}
                    onToggle={() => setOpenDropdownId(openDropdownId === row.id_proceso ? null : row.id_proceso)}
                    items={
                        [
                            {
                                label: 'Editar proceso',
                                icon:'edit',
                                onClick:()=>{onEdit(row)}
                            },
                            {
                                label: 'Eliminar proceso',
                                icon: 'delete',
                                color: 'red',
                                onClick: ()=>{onDelete(row)}
                            }
                        ]
                    }   
                />)
            
        }
    ]

    return(
        <>
            <div style={{display:'flex', textAlign:'start',alignItems:'center', width:'100%',marginBottom:'20px',justifyContent:'space-between'}}>
                <div>
                    <h3 style={{fontWeight:'500'}}>Listado de procesos</h3>
                    <p className="table-description">
                        Visualización, edición y eliminación de procesos
                    </p>
                </div>
            </div>
            <Table data={procesos} columns={columnas}></Table>
        </>
    );
}