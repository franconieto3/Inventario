import NavBar from "../../../components/layout/NavBar";
import { ChangeRequestRowActions } from "../components/RowActions";
import Table from "../../../components/ui/Table";
import { useChangeRequest } from "../hooks/useChangeRequests";
import { useDocuments } from "../../products/hooks/useDocuments";

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
            <button>
              <i className="material-icons">open_in_new</i>
            </button>
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
        render: (_)=>_? new Date(_).toLocaleDateString() : "- - -"
      },
      {
        key:"usuario_respuesta",
        header: "Responsable",
        render: (_)=>_? _ : "- - -"
      },
      {
        key:"",
        header:"",
        render:(_, row) => <ChangeRequestRowActions row={row} />
      }
    ]

    return(
        <>
            <NavBar />
            <div className="body-container">
                <Table data={solicitudes} columns={columnas}/>
            </div>
        </>

    );
}