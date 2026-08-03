import { useState } from "react";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Table from "../../../components/ui/Table";
import { Modal } from "../../../components/ui/Modal";
import { useEffect } from "react";
import Button from "../../../components/ui/Button";
import Can from "../../../components/Can";
import { useNavigate } from "react-router-dom";

export function ListadoRutasFabricacion({
    rutas, 
    tipos,  
    page, 
    totalPages,
    refreshRutas,
    tipoSeleccionado,
    setTipoSeleccionado,
    setPage, 
}
){

    const navigate = useNavigate();
    const [mostrarRuta, setMostrarRuta] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const columnas = [
        {
            key:'nombre',
            header:'Nombre',
            render: (_, row)=>(
                <div onClick={()=>navigate(`/flujograma/${row.id_ruta}`)} style={{'cursor':'pointer'}}>
                    {_}
                </div>
            )
            
        },
        {
            key:'',
            header: 'Tipo de ruta',
            render: (_, row)=> (<span>{row.tipo_ruta.descripcion}</span>)
        }
    ]

    //Paginación
    const handlePrevPage = () => setPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setPage(prev => Math.min(totalPages, prev + 1));

    return (
        <>
            <div style={{display:'flex', textAlign:'start',alignItems:'center', width:'100%',marginBottom:'20px',justifyContent:'space-between', flexWrap:'wrap-reverse'}}>
                <div>
                    <h3 style={{fontWeight:'500'}}>Listado de rutas de fabricación</h3>
                    <p className="table-description">
                        Visualización, edición y eliminación de rutas de fabricación
                    </p>
                </div>
                <div style={{display:'flex', gap:'15px', alignItems:'center', justifyContent:'start'}}>
                    <select onChange={(e)=>{setTipoSeleccionado(e.target.value)}}>
                        <option value="0">Todos los tipos</option>
                        {tipos.map(
                            (t)=>(
                            <option key={t.id_tipo_ruta} value={t.id_tipo_ruta}>{t.descripcion}</option>
                            )
                        )}
                    </select>
                    <Can permission="crear_rutas_procesos">
                        <div style={{marginBottom:'15px', marginTop:'15px'}}>
                            <Button onClick={()=>navigate(`/flujograma/new`)}>
                                Nueva ruta de procesos
                            </Button>
                        </div>
                    </Can>
                </div>
            </div>

            <Table data={rutas} columns={columnas}/>  

            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems:'center', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={handlePrevPage} 
                        disabled={page === 1 || loadingGraphs}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_left</i>
                    </button>
                    <span>{page} / {totalPages}</span>
                    <button 
                        onClick={handleNextPage} 
                        disabled={page === totalPages || loadingGraphs}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_right</i>
                    </button>
                </div>
            )}

        </>
    )
}