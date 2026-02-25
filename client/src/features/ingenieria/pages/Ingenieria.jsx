import NavBar from "../../../components/layout/NavBar";
import { ChangeRequestRowActions } from "../components/RowActions";
import Table from "../../../components/ui/Table";
import { useChangeRequest } from "../hooks/useChangeRequests";
import { useDocuments } from "../../products/hooks/useDocuments";


//Estilos
import "./Ingenieria.css"
import { useEffect } from "react";

export function Ingenieria(){

    const {solicitudes,
        estados,
        loadingRequests,
        page,
        totalPages,
        setPage,
        setSelectedStatus,
        refreshRequests} = useChangeRequest();
    
    const {verDocumento} = useDocuments();
    
    //Paginación
    const handlePrevPage = () => setPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setPage(prev => Math.min(totalPages, prev + 1));
    
    const columnas = [
      {
        key: "name",
        header: "Solicitado por"},
      {
        key: "fecha_emision",
        header: "Fecha",
        render: (_)=> new Date(_).toLocaleDateString()
      },
      {
        key: "path",
        header: "Versión afectada",
        render: (_)=>(
          <div style={{'display':'flex','alignItems':'center','gap':'5px','cursor':'pointer'}} onClick={()=>verDocumento(_)}>
            <i className="material-icons">open_in_new</i>
            <span> Ver documento</span>
          </div>
        )
      },
      {
        key: "mensaje",
        header: "Observaciones",
        render: (_)=>(
          <p style={{'maxWidth':'350px'}}>{_}</p>
        )
      },
      {
        key: "descripcion",
        header: "Estado",
        render: (status) => {
          const STATUS_STYLES = {
            pendiente: { backgroundColor: '#fef3c7', color: '#92400e' },
            aceptada:  { backgroundColor: '#dcfce7', color: '#166534' },
            rechazada: { backgroundColor: '#fee2e2', color: '#991b1b' } 
          };

          const key = String(status).toLowerCase();
          const styles = STATUS_STYLES[key] ?? { backgroundColor: '#e5e7eb', color: '#374151' }; // fallback

          return (
            <span style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 500,
              ...styles
            }}>
              {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
            </span>
          );
        }
      },
      {
        key:"fecha_cierre",
        header: "Fecha de cierre",
        render: (_)=> _ ===null? "- - -" : new Date(_).toLocaleDateString()
      },
      {
        key:"nombre_responsable",
        header: "Responsable",
        render: (_)=> _ ===null? "- - -" : _
      },
      {
        key:"",
        header:"",
        render:(_, row) => row.id_estado_solicitud ===1? <ChangeRequestRowActions row={row} onUpdate={refreshRequests}/> : ""
      }
    ]

    return(
        <>
            <NavBar />
            <div className="body-container">
              <div className="ingenieria-tc">
                <p className='ingenieria-titulos'>Ingeniería</p>
              </div>
              <div style={{display:'flex', textAlign:'start',alignItems:'center', width:'100%',marginBottom:'20px',justifyContent:'space-between'}}>
                <div>
                  <h3 style={{fontWeight:'500'}}>Solicitudes de cambios</h3>
                  <p className="table-description">
                    Seguimiento de todas las solicitudes de cambio en documentos relacionados a piezas.
                  </p>
                </div>
                
                <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap', justifyContent:'start'}}>
                  <select onChange={(e)=>{setSelectedStatus(e.target.value)}}>
                    <option value="0">Todos los estados</option>
                    {estados.map(
                      (estado)=>(
                        <option key={estado.id_estado_solicitud} value={estado.id_estado_solicitud}>{estado.descripcion}</option>
                      )
                    )}
                  </select>
                </div>

              </div>
              <Table data={solicitudes} columns={columnas}/>

              {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems:'center', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={handlePrevPage} 
                        disabled={page === 1 || loadingRequests}
                        className="pagination-button" // Asegúrate de tener estilos o usa estilos inline
                    >
                        <i className="material-icons">chevron_left</i>
                    </button>
                    <span>{page} / {totalPages}</span>
                    <button 
                        onClick={handleNextPage} 
                        disabled={page === totalPages || loadingRequests}
                        className="pagination-button"
                    >
                        <i className="material-icons">chevron_right</i>
                    </button>
                </div>
              )}

            </div>
        </>

    );
}