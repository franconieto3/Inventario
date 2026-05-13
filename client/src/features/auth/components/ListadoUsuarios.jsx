import { useEffect, useState } from "react";
import Table from "../../../components/ui/Table";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Button from "../../../components/ui/Button";

export function ListadoUsuarios({usuarios, onOpen}){


    const [openDropdownId, setOpenDropdownId] = useState(null);

    const columns = [
        {
            key: "name",
            header: "Nombre"
        },{
            key: "dni",
            header: "DNI"
        },{
            key: "email",
            header: "Email"
        },{
            key: "estado_descripcion",
            header: "Estado"
        },{
            key: "roles",
            header: "Rol/es",
            render: (_)=> _ || "---"
        },{
            key: "sector",
            header: "Sector/es",
            render: (_)=> _ || "---"
        },{
            key: "",
            header: "Acciones",
            render: (_, row)=>(
            <DropdownMenu
                items={[
                    {
                        label: "Administrar",
                        icon: "edit",
                        onclick:()=>{}
                    },
                    {
                        label: "Eliminar",
                        icon: "delete",
                        color: "red",
                        onclick:()=>{}
                    }
                ]}
                isOpen={openDropdownId === row.id_usuario}
                onToggle={() => setOpenDropdownId(openDropdownId === row.id_usuario ? null : row.id_usuario)}
            ></DropdownMenu>
            )
        }
    ]
    return(
        <>
            <div style={{display:'flex', textAlign:'start',alignItems:'center', width:'100%',marginBottom:'20px',justifyContent:'space-between', flexWrap: 'wrap'}}>
                <div>
                <h3 style={{fontWeight:'500'}}>Listado de usuarios</h3>
                <p className="table-description">
                    Seguimiento de usuario, con sus respectivos roles y sectores.
                </p>
                </div>
                <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                <Button variant='default' onClick={onOpen}>
                    Agregar nuevo usuario
                </Button>
                </div>
            </div>

            <Table data={usuarios} columns={columns}></Table>
        </>
    );
}