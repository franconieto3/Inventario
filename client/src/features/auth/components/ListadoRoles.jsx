import { useState } from "react";
import Button from "../../../components/ui/Button";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Table from "../../../components/ui/Table";
import { Modal } from '../../../components/ui/Modal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function ListadoRoles({roles, onOpen, onEdit, onDelete}){
    
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [mostrarPermisos, setMostrarPermisos] = useState(false);
    const [rolSeleccionado, setRolSeleccionado] = useState(null);

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
                                onClick:()=>onEdit(row)
                                },
                                {
                                label: "Eliminar",
                                icon: "delete",
                                color: "red",
                                onClick:()=>handleDelete(row)
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