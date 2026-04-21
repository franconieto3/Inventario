import { useEffect, useState } from "react";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { AgregarInstrumento } from "../components/AgregarInstrumento";
import { useInstruments } from "../hooks/useInstruments";
import { ListadoInstrumentos } from "../components/ListadoInstrumentos";
import { EditarInstrumentos } from "../components/EditarInstrumentos";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function Instrumentos(){
    const [crearInstrumento, setCrearInstrumento] = useState(false);
    const [editarInstrumento, setEditarInstrumento] = useState(false);
    const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState(null)

    // Estado para controlar la paginación y filtros desde el componente padre
    const [params, setParams] = useState({ 
        page: 1, 
        limit: 10, 
        tipo: '', 
        sectorId: '' ,
        estado: ''
    });

    // Pasamos el estado de 'params' al Hook para que escuche sus cambios
    const {
        instrumentos,
        sectores,
        enums,
        totalRecords,
        loading,
        error,
        refetch
    } = useInstruments(params);

    // Funciones placeholders para las acciones del Dropdown
    const handleEdit = (instrumento) => {
        setInstrumentoSeleccionado(instrumento)
        setEditarInstrumento(true);
    };

    const handleDelete = async (instrumento) => {
        console.log("Eliminar instrumento:", instrumento);
        if(window.confirm("¿Desea eliminar el instrumento seleccionado?")){
            try{
                const res = await apiCall(`${API_URL}/api/instrumentos/${instrumento.id_instrumento}`, {method: 'DELETE'});
                refetch();

            }catch(err){
                console.log(err.message);
            }
        }
    };

    return(
        <>
            <NavBar />
            <div className="body-container">
                <div className="ingenieria-tc">
                    <p className='ingenieria-titulos'>Elementos de control</p>
                </div>
                <div style={{display:'flex', textAlign:'start',alignItems:'center', width:'100%',marginBottom:'20px',justifyContent:'space-between', flexWrap: 'wrap'}}>
                    <div>
                        <h3 style={{fontWeight:'500'}}>Listado de elementos de control</h3>
                        <p className="table-description">
                            Seguimiento de todas los instrumentos de medición y control.
                        </p>
                    </div>
                    <Button variant="default" onClick={()=>setCrearInstrumento(true)} style={{marginTop:'15px', marginBottom:'15px'}}>
                        Agregar elemento de control
                    </Button>
                </div>

                {/* Manejo de estados de carga, error y renderizado del Listado */}
                {loading ? (
                    <p>Cargando instrumentos...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>Error al cargar los datos: {error}</p>
                ) : (
                    <ListadoInstrumentos 
                        data={instrumentos}
                        sectores={sectores}
                        tiposInstrumento={enums.tiposInstrumento}
                        params={params}
                        onParamsChange={setParams}
                        totalRecords={totalRecords}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}

            </div>
            {crearInstrumento &&
                <Modal
                    titulo="Agregar elemento de medición o control"
                    descripcion=""
                    onClose={()=>setCrearInstrumento(false)}
                >
                    <AgregarInstrumento
                        onClose={() => setCrearInstrumento(false)} 
                        onSuccess={refetch}
                        sectores={sectores}
                        enums={enums} 
                    >
                    </AgregarInstrumento>
                </Modal>
            }
            {
                editarInstrumento &&
                <Modal
                    titulo="Editar instrumento"
                    descripcion= {instrumentoSeleccionado.nro_serie? instrumentoSeleccionado.nro_serie : ''}
                    onClose={()=>{
                            setEditarInstrumento(false);
                            setInstrumentoSeleccionado(null);
                        }
                    }
                >
                    <EditarInstrumentos 
                        instrumento={instrumentoSeleccionado}
                        onSuccess={refetch} 
                        onClose={() => {
                            setEditarInstrumento(false);
                            setInstrumentoSeleccionado(null);
                        }}
                        enums={enums} 
                    />
                </Modal>
            }
        </>    
    );
}