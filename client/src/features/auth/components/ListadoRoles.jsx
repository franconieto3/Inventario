import { useState } from "react";
import Button from "../../../components/ui/Button";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Table from "../../../components/ui/Table";

export function ListadoRoles({roles, onOpen}){
    
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const columns = [
        {
            key: "descripcion",
            header: "Descripción"
        },{
            key: "",
            header: "",
            render: (_, row)=>(
                <div style={{display:'flex',justifyContent:'end'}}>
                    <DropdownMenu 
                        isOpen={openDropdownId === row.id_permiso} 
                        onToggle={openDropdownId === row.id_permiso ? null : row.id_permiso} 
                        items={
                            [
                                {
                                label: "Editar",
                                icon: "edit",
                                onclick:()=>{}
                                },
                                {
                                label: "Eliminar",
                                icon: "delete",
                                color: "red",
                                onclick:()=>{}
                                }
                            ]
                        }
                    />
                </div>
            )
        }
    ]

    return(
        <>
            <div style={{display:'flex', textAlign:'start',alignItems:'center', width:'100%',marginBottom:'20px',justifyContent:'space-between', flexWrap: 'wrap'}}>
                <div>
                <h3 style={{fontWeight:'500'}}>Listado de roles</h3>
                <p className="table-description">
                    Seguimiento de roles, con sus respectivos permisos.
                </p>
                </div>
                <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                <Button variant='default' onClick={onOpen}>
                    Agregar nuevo rol
                </Button>
                </div>
            </div>
            <Table data={roles} columns={columns}></Table>
        </>
    );
}