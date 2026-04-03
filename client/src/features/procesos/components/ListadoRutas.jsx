import { useState } from "react";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import Table from "../../../components/ui/Table";
import { useProcessRoutes } from "../hooks/useProcessRoutes";
import { Modal } from "../../../components/ui/Modal";
import { useEffect } from "react";
import { DetalleRuta } from "./DetalleRuta";

export function ListadoRutas({
    rutas, 
    tipos,  
    page, 
    totalPages,
    refreshRutas,
    tipoSeleccionado,
    setTipoSeleccionado,
    setPage, 
    onEdit, 
    onDelete}
){

    const [mostrarRuta, setMostrarRuta] = useState(false);
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null)

    const [openDropdownId, setOpenDropdownId] = useState(null);

    const verRuta = (bop)=>{
        setRutaSeleccionada(bop);
        setMostrarRuta(true);
    }

    const columnas = [
        {
            key:'nombre',
            header:'Nombre',
            render: (_, row)=>(
                <div onClick={()=>verRuta(row)} style={{'cursor':'pointer'}}>
                    {_}
                </div>
            )
            
        },
        {
            key:'',
            header: 'Tipo de ruta',
            render: (_, row)=> (<span>{row.tipo_ruta.descripcion}</span>)
        },
        {
            key:'',
            header: '',
            render: (_, row)=> (
                <div style={{display:'flex', justifyContent: 'end'}}>
                    <DropdownMenu
                        isOpen={openDropdownId === row.id_bop}
                        onToggle={() => setOpenDropdownId(openDropdownId === row.id_bop ? null : row.id_bop)}
                        items={
                            [
                                {
                                    label: 'Editar ruta',
                                    icon:'edit',
                                    onClick:()=>{onEdit(row)}
                                },
                                {
                                    label: 'Eliminar ruta',
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

    return (
        <>
            <div style={{display:'flex', textAlign:'start',alignItems:'center', width:'100%',marginBottom:'20px',justifyContent:'space-between'}}>
                <div>
                    <h3 style={{fontWeight:'500'}}>Listado de rutas de procesos</h3>
                    <p className="table-description">
                        Visualización, edición y eliminación de rutas de procesos
                    </p>
                </div>
                <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap', justifyContent:'start'}}>
                    <select onChange={(e)=>{setTipoSeleccionado(e.target.value)}}>
                    <option value="0">Todos los tipos</option>
                    {tipos.map(
                        (t)=>(
                        <option key={t.id_tipo_ruta} value={t.id_tipo_ruta}>{t.descripcion}</option>
                        )
                    )}
                    </select>
                </div>
            </div>

            <Table data={rutas} columns={columnas}/>  

            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems:'center', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={handlePrevPage} 
                        disabled={page === 1 || loadingRoutes}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_left</i>
                    </button>
                    <span>{page} / {totalPages}</span>
                    <button 
                        onClick={handleNextPage} 
                        disabled={page === totalPages || loadingRoutes}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_right</i>
                    </button>
                </div>
            )}

            { mostrarRuta &&
                <Modal 
                    titulo= "Ruta de procesos"
                    descripcion={rutaSeleccionada.nombre}
                    onClose={()=>setMostrarRuta(false)}
                >
                    <DetalleRuta ruta={rutaSeleccionada}/>
                </Modal>
            }
        </>
    )
}