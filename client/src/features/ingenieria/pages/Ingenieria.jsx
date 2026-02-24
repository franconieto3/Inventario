import NavBar from "../../../components/layout/NavBar";
import { ChangeRequestRowActions } from "../components/RowActions";
import Table from "../../../components/ui/Table";
import { useChangeRequest } from "../hooks/useChangeRequests";
import { useDocuments } from "../../products/hooks/useDocuments";


//Estilos
import "./Ingenieria.css"

export function Ingenieria(){

    const {solicitudes,
        loadingRequests,
        page,
        setPage,
        refreshRequests} = useChangeRequest();
    
    const {verDocumento} = useDocuments();

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
            rechazadA: { backgroundColor: '#fee2e2', color: '#991b1b' } // cuidado con mayúsculas si no normalizas
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
              <div style={{display:'flex', textAlign:'start',alignItems:'center', maxWidth:'500px',marginBottom:'20px'}}>
                <div>
                  <h3 style={{fontWeight:'500'}}>Solicitudes de cambios</h3>
                  <p className="table-description">
                    Seguimiento de todas las solicitudes de cambio en documentos relacionados a piezas.
                  </p>
                </div>
              </div>
              <Table data={solicitudes} columns={columnas}/>
            </div>
        </>

    );
}