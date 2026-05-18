import { useEffect, useState } from "react";
import Table from "../../../components/ui/Table";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Button from "../../../components/ui/Button";

export function ListadoUsuarios({usuarios, onEditUser, onOpen, onEditRoles, onEditSectores, onDelete}){

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
            key: "",
            header: "Estado",
            render: (_, row)=>(<span>{row.estado_usuario.descripcion}</span>)
        },{
            key: "roles",
            header: "Rol/es",
            render: (_, row)=> row.roles.length > 0?                 
                (<ul>
                    {
                        row.roles.map(
                            (rol)=>(
                            <li 
                                key={rol.id_rol}
                                style={{listStyle:'none'}}
                            >
                                {rol.descripcion}
                            </li>
                            )
                        )
                    }
                </ul>) : 
                (<span>"---"</span>)
        },{
            key: "sectores",
            header: "Sector/es",
            render: (_, row)=> row.sectores.length > 0?                 
            (<ul>
                {
                    row.sectores.map(
                        (sector)=>(<li key={sector.id_sector} style={{listStyle:'none'}}>{sector.descripcion}</li>)
                    )
                }
            </ul>) : 
            (<span>"---"</span>)
        },{
            key: "",
            header: "Acciones",
            render: (_, row)=>(
            <DropdownMenu
                items={[
                    {
                        label: "Editar perfil",
                        icon: "manage_accounts",
                        onClick:()=>onEditUser(row)
                    },
                    {
                        label: "Administrar roles",
                        icon: "label",
                        onClick:()=>onEditRoles(row)
                    },
                    {
                        label: "Administrar sectores",
                        icon: "arrow_forward",
                        onClick:()=>onEditSectores(row)
                    },
                    {
                        label: "Dar de baja",
                        icon: "delete",
                        color: "red",
                        onClick:()=>onDelete(row)
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

            <Table data={usuarios} columns={columns} padding="180px"></Table>
        </>
    );
}