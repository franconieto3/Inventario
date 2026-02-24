import { useNavigate } from "react-router-dom";
import Table from "../../../components/ui/Table";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { useState } from "react";
import Can from "../../../components/Can";


export function ListadoProductos({data, onEdit, onDelete}){

    const navigate = useNavigate();
    //const [isOpen, setIsOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    return (
        <>
            <Table
                data={data} 
                columns={
                    [
                        {
                            key:"nombre", 
                            header:"Nombre",
                            render: (_, row)=>(
                                <div onClick={()=>navigate(`/producto/${row.id_producto}`)} style={{'cursor':'pointer'}}>
                                    {_}
                                </div>
                            )
                        },
                        {
                            key:"descripcion_rubro", 
                            header:"Rubro"
                        },
                        {
                            key:"descripcion_registro", 
                            header:"Producto médico"
                        },
                        {
                            key:"",
                            header:"",
                            render:(_,row)=>(
                                <Can permission="administrar_productos">
                                    <DropdownMenu
                                        isOpen={openDropdownId === row.id_producto}
                                        onToggle={() => setOpenDropdownId(openDropdownId === row.id_producto ? null : row.id_producto)}
                                        items={[
                                            {
                                                label: 'Editar producto',
                                                icon: 'edit',
                                                onClick: () => onEdit(row)
                                            },
                                            {
                                                label: 'Eliminar producto',
                                                icon: 'delete',
                                                color: 'red', 
                                                onClick: () => onDelete(row)
                                            }                       
                                        ]}
                                    />
                                </Can>
                            )
                        }
                    ]}>
            </Table>
        </>
    );
}