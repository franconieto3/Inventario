import { useState } from "react";
import Button from "../../../components/ui/Button";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Table from "../../../components/ui/Table";
import { Modal } from '../../../components/ui/Modal';
import Can from "../../../components/Can";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function ListadoRoles({roles, onOpen, onEdit, onDelete, page, setPage, totalPages, loading}){
    
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [mostrarPermisos, setMostrarPermisos] = useState(false);
    const [rolSeleccionado, setRolSeleccionado] = useState(null);

    const handlePrevPage = () => setPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setPage(prev => Math.min(totalPages, prev + 1));

    const handleDelete = async(rol)=>{
        
        try{
            const res = await apiCall(`${API_URL}/api/usuarios/rol/${rol.id_rol}`,{method: 'DELETE'})
            if(onDelete) onDelete();

        }catch(err){
            console.log(err.message);
            alert(err.message);
        }
    }

    const columns = [
        {
            key: "descripcion",
            header: "Descripción",
            render: (_, row)=>(
                <span 
                    onClick={()=>{
                        setRolSeleccionado(row);
                        setMostrarPermisos(true);
                    }} 
                    style={{cursor: 'pointer'}}>
                        {_}
                </span>
            )
        },{
            key: "nivel",
            header: "Nivel"
        },{
            key: "",
            header: "",
            render: (_, row)=>(
                <div style={{display:'flex',justifyContent:'end'}}>
                    <DropdownMenu 
                        isOpen={openDropdownId === row.id_rol} 
                        onToggle={() => setOpenDropdownId(openDropdownId === row.id_rol ? null : row.id_rol)}
                        items={
                            [
                                {
                                label: "Editar",
                                icon: "edit",
                                onClick:()=>onEdit(row),
                                permission: 'editar_roles'
                                },
                                {
                                label: "Eliminar",
                                icon: "delete",
                                color: "red",
                                onClick:()=>handleDelete(row),
                                permission: 'eliminar_roles'
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
                    <Can permission='crear_roles'>
                        <Button variant='default' onClick={onOpen}>
                            Agregar nuevo rol
                        </Button>
                    </Can>
                </div>
            </div>
            <Table data={roles} columns={columns}></Table>

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

            {mostrarPermisos &&
                <Modal
                    titulo="Permisos asociados"
                    descripcion={rolSeleccionado.descripcion}
                    onClose={()=>setMostrarPermisos(false)}
                >
                    <ul>
                        {rolSeleccionado.permisos.map(
                            (r)=><li style={{listStyle:'none', padding:'5px'}}>{r.descripcion}</li>
                        )}
                    </ul>
                </Modal>
            }
        </>
    );
}