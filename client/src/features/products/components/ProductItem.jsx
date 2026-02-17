//Componentes
import { useState } from 'react';

import { apiCall } from '../../../services/api';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';

//Estilos
import "./ProductItem.css"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ProductItem({ producto, onChange, onEdit, onDelete}){

    //Método para llamar a la API al hacer click
    const [menuProductoOpen, setMenuProductoOpen] = useState(false);

    const editar = ()=>{
        onEdit(producto);
    }

    const handleEliminarProducto = async ()=>{
        if(window.confirm("¿Seguro que deseas eliminar este producto?")){
            console.log("Eliminando producto")
            try{
                const res = await apiCall(`${API_URL}/api/productos/eliminacion/${producto.id_producto}`, {'method':"DELETE"});
                //alert(`${producto.nombre} eliminado exitosamente`);
                //window.location.reload();
                if (onDelete) onDelete();
                
            }catch(err){
                alert("No se pudo eliminar el producto seleccionado");
            }
        }
    }
    
    return(
        <>
        <div className='product-item' >
            <div className='product-name' onClick={()=>{onChange(producto.id_producto)}}>
                <i className="material-icons">folder</i>
                <span>{producto.nombre}</span>
            </div>
            
            <div>
                <DropdownMenu
                    isOpen={menuProductoOpen}
                    onToggle={() => setMenuProductoOpen(!menuProductoOpen)}
                    items={[
                        {
                            label: 'Editar producto',
                            icon: 'edit',
                            onClick: () => editar()
                        },
                        {
                            label: 'Eliminar producto',
                            icon: 'delete',
                            color: 'red', 
                            onClick: () => handleEliminarProducto()
                        }
                                                
                    ]}
                />
            </div>
            
        </div>
        </>
    );
}
