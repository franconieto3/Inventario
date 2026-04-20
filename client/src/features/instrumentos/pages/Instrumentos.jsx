import { useEffect, useState } from "react";
import NavBar from "../../../components/layout/NavBar";
import Button from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { AgregarInstrumento } from "../components/AgregarInstrumento";
import { useInstruments } from "../hooks/useInstruments";
import { ListadoInstrumentos } from "../components/ListadoInstrumentos";

export function Instrumentos(){
    const [crearInstrumento, setCrearInstrumento] = useState(false);

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
        console.log("Editar instrumento:", instrumento);
    };

    const handleDelete = (instrumento) => {
        console.log("Eliminar instrumento:", instrumento);
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
                        onSuccess={(nuevoInstrumento) => {
                            // Aquí en el futuro llamarás a mutate() o refrescarás el state de tu tabla
                            console.log("Guardado con éxito:", nuevoInstrumento);
                        }}
                        sectores={sectores}
                        enums={enums} 
                    >
                    </AgregarInstrumento>
                </Modal>
            }
        </>    
    );
}