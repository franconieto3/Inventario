import { useState } from "react";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Table from "../../../components/ui/Table";

export function ListadoProcesos({
    procesos,
    tipos,
    unidades,
    page,
    setPage,
    totalPages,
    setTipoSeleccionado,
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
            key:"",
            header:"Tipo de proceso",
            render: (_, row)=> <span>{row.tipo_proceso.descripcion}</span>
        },
        {
            key: "unidad_tiempo",
            header: "Intervalo de medición"
        },
        {
            key: "",
            header: "",
            render: (_, row) =>(
                <div style={{display:'flex', justifyContent: 'end'}}>
                    <DropdownMenu
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
                    />
                </div>
                )
            
        }
    ]

    //Paginación
    const handlePrevPage = () => setPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setPage(prev => Math.min(totalPages, prev + 1));

    return(
        <>
            <div style={{display:'flex', textAlign:'start',alignItems:'center', width:'100%',marginBottom:'20px',justifyContent:'space-between'}}>
                <div>
                    <h3 style={{fontWeight:'500'}}>Listado de procesos</h3>
                    <p className="table-description">
                        Visualización, edición y eliminación de procesos
                    </p>
                </div>

                <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap', justifyContent:'start'}}>
                    <select onChange={(e)=>{setTipoSeleccionado(e.target.value)}}>
                    <option value="0">Todos los tipos</option>
                    {tipos.map(
                        (t)=>(
                        <option key={t.id_tipo_proceso} value={t.id_tipo_proceso}>{t.descripcion}</option>
                        )
                    )}
                    </select>
                </div>

            </div>
            <Table data={procesos} columns={columnas}/>

            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems:'center', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={handlePrevPage} 
                        disabled={page === 1 || loadingProcesos}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_left</i>
                    </button>
                    <span>{page} / {totalPages}</span>
                    <button 
                        onClick={handleNextPage} 
                        disabled={page === totalPages || loadingProcesos}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_right</i>
                    </button>
                </div>
            )}
        </>
    );
}