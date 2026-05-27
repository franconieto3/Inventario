import { useState, useMemo } from "react";
import Table from "../../../components/ui/Table";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { Modal } from "../../../components/ui/Modal";
import { EditarCategoria } from "./EditarCategoria";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function ListadoCategorias({data, enums, onEditSuccess}){
    
    const [openDropdownId,setOpenDropdownId] = useState(null);
    const [selected, setSelected] = useState(null);

    //Paginación
    const [page, setPage] = useState(1);
    const itemsPerPage = 10; 

    const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

    const currentData = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return data?.slice(start, end) || [];
    }, [data, page, itemsPerPage]);

    const handlePrevPage = () => setPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setPage(prev => Math.min(totalPages, prev + 1));


    const onEdit = async (categoria)=>{
        setSelected(categoria)
    }

    const onDelete = async(categoria)=>{
        if (window.confirm("¿Seguro desea borrar esta categoría de instrumentos? La eliminación afectará también a todos los instrumentos asociados.")){
            try{
                const res = await apiCall(`${API_URL}/api/instrumentos/categoria/${categoria.id_categoria}`,{method:'DELETE'}) 
                alert("Categoria eliminada exitosamente");
                
                if(onEditSuccess) onEditSuccess();

            }catch(err){
                alert('Ocurrió un error', err.message);
                console.log(err);
            }
        }
        return null;
    }

    const columns = [
        {
            key: "descripcion", 
            header: "Descripción",
        },
        {
            key:'tipo',
            header: "Tipo de elemento"
        },
        {
            key:'tipo_proveedor',
            header:"Tipo de proveedor"
        },
        {
            key:'frecuencia_meses',
            header:"Frecuencia de verificación",
            render: (_, row) => (<span>{row.frecuencia_meses} meses</span>)
        },
        {
            key: 'usos_maximos',
            header: "Usos máximos",
            render: (_, row)=> (<span>{row.tipo == 'PROBADOR'? row.usos_maximos : ' --- '}</span>)
        },
        {
            key:'',
            header: "Acciones",
            render: (_, row)=>(
                <DropdownMenu
                    isOpen={openDropdownId === row.id_categoria}
                    onToggle={() => setOpenDropdownId(openDropdownId === row.id_categoria ? null : row.id_categoria)}
                    items={[
                        {                            
                            label: 'Editar categoría',
                            icon: 'edit',
                            onClick: () => onEdit(row),
                            permission: 'editar_categorias_instrumentos'
                        },
                        {
                            label: 'Eliminar categoría',
                            icon: 'delete',
                            color: 'red',
                            onClick: () => onDelete(row),
                            permission: 'eliminar_categorias_instrumentos'
                        }
                    ]}
                >
                </DropdownMenu>
            )
        }
    ]
    
    return (
        <>
            <div style={{display:'flex', textAlign:'start',alignItems:'center', width:'100%', marginBottom:'30px',justifyContent:'space-between', flexWrap: 'wrap'}}>
                <div>
                    <h3 style={{fontWeight:'500'}}>Listado de categorías</h3>
                    <p className="table-description">
                        Seguimiento de todas las categorías de instrumentos de medición y control.
                    </p>
                </div>
            </div>
            <Table data={currentData} columns={columns} />

            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                    <button
                        onClick={handlePrevPage}
                        disabled={page === 1}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_left</i>
                    </button>
                    <span>{page} / {totalPages}</span>
                    <button
                        onClick={handleNextPage}
                        disabled={page === totalPages}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_right</i>
                    </button>
                </div>
            )}

            {selected &&
                <Modal
                    titulo="Editar categoría de elemento de control"
                    descripcion={selected.descripcion}
                    onClose={()=>setSelected(null)}
                >
                    <EditarCategoria
                        onClose={()=>setSelected(null)}
                        onSuccess={onEditSuccess}
                        enums={enums}
                        categoria={selected}
                    />
                </Modal>
            }
        </>
    )
}