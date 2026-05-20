import { useEffect, useState } from "react";
import Table from "../../../components/ui/Table";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Button from "../../../components/ui/Button";
import Can from "../../../components/Can";

export function ListadoUsuarios({usuarios, onEditUser, onOpen, onEditRoles, onEditSectores, onDelete, page, setPage, totalPages, loading}){

    const [openDropdownId, setOpenDropdownId] = useState(null);

    // --- LÓGICA DE PAGINACIÓN ---
    const handlePrevPage = () => setPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setPage(prev => Math.min(totalPages, prev + 1));

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
                        onClick:()=>onEditUser(row),
                        permission:'administrar_usuarios'
                    },
                    {
                        label: "Administrar roles",
                        icon: "label",
                        onClick:()=>onEditRoles(row),
                        permission: 'administrar_roles_usuarios'
                    },
                    {
                        label: "Administrar sectores",
                        icon: "arrow_forward",
                        onClick:()=>onEditSectores(row),
                        permission: 'administrar_sectores_usuarios'
                    },
                    {
                        label: "Dar de baja",
                        icon: "delete",
                        color: "red",
                        onClick:()=>onDelete(row),
                        permission: 'baja_usuarios'
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
                <Can permission="crear_usuarios">
                    <Button variant='default' onClick={onOpen}>
                        Agregar nuevo usuario
                    </Button>
                </Can>
                </div>
            </div>

            <Table data={usuarios} columns={columns} padding="180px"></Table>

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems:'center', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={handlePrevPage} 
                        disabled={page === 1 || loading}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_left</i>
                    </button>
                    <span>{page} / {totalPages}</span>
                    <button 
                        onClick={handleNextPage} 
                        disabled={page === totalPages || loading}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_right</i>
                    </button>
                </div>
            )}

        </>
    );
}