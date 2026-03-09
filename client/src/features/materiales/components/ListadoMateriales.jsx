import { useState } from "react";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Table from "../../../components/ui/Table";
import { useMateriales } from "../hooks/useMateriales";

export function ListadoMateriales({ 
        rubros, 
        materiales, 
        loadingMaterials, 
        totalPages, 
        page, 
        setPage, 
        setRubroSeleccionado,
        onEdit,
        onDelete 
    }){
    
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const columnas = [
        {
            key:"descripcion",
            header:"Descripcion"
        },
        {
            key: "descripcion_rubro",
            header: "Rubro"
        },
       {
            key: "es_trazable",
            header: "Trazable",
            render: (_)=> _ ? "Sí" : "No"
        },
        {
            key: "descripcion_unidad",
            header: "Métrica de consumo"
        },
        {
            key:"atributos",
            header: "Atributos",
            render: (_) =>
            Object.keys(_).map(key => (
                <p key={key}>
                {key}: {_[key]}
                </p>
            ))
        },
        {
            key:"",
            header: "",
            render: (_,row)=>(
                <DropdownMenu
                    isOpen={openDropdownId === row.id_material}
                    onToggle={() => setOpenDropdownId(openDropdownId === row.id_material ? null : row.id_material)}
                    items={
                        [
                            {
                                label: 'Editar material',
                                icon:'edit',
                                onClick:()=>{onEdit(row)}
                            },
                            {
                                label: 'Eliminar material',
                                icon: 'delete',
                                color: 'red',
                                onClick: ()=>{onDelete(row)}
                            }
                        ]
                    }
                />
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
                    <h3 style={{fontWeight:'500'}}>Listado de materiales</h3>
                    <p className="table-description">
                        Listado de materias primas, envasado e insumos
                    </p>
                </div>
                <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap', justifyContent:'start'}}>
                    <select onChange={(e)=>{setRubroSeleccionado(e.target.value)}}>
                    <option value="0">Todos los rubros</option>
                    {rubros.map(
                        (rubro)=>(
                        <option key={rubro.id_rubro_material} value={rubro.id_rubro_material}>{rubro.descripcion}</option>
                        )
                    )}
                    </select>
                </div>

            </div>

            <Table data={materiales} columns={columnas}/>

            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems:'center', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={handlePrevPage} 
                        disabled={page === 1 || loadingMaterials}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_left</i>
                    </button>
                    <span>{page} / {totalPages}</span>
                    <button 
                        onClick={handleNextPage} 
                        disabled={page === totalPages || loadingMaterials}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_right</i>
                    </button>
                </div>
            )}

        </>
    );
}