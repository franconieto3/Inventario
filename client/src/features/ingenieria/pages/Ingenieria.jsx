import NavBar from "../../../components/layout/NavBar";
import { ChangeRequestRowActions } from "../components/RowActions";
import Table from "../../../components/ui/Table";
import { useChangeRequest } from "../hooks/useChangeRequests";

const misDatos = [
  { id: "1", name: "Project Alpha", date: "Jan 15, 2024", status: "completed", amount: "$2,500" },
  { id: "2", name: "Website Redesign", date: "Feb 3, 2024", status: "processing", amount: "$4,200" },
  { id: "3", name: "Mobile App MVP", date: "Feb 18, 2024", status: "pending", amount: "$8,750" },
];

const menuItems = [
    { 
      label: 'Ver detalles', 
      icon: 'visibility', 
      onClick: () => console.log('Viendo detalles de:', row.id) 
    },
    { 
      label: 'Editar', 
      icon: 'edit', 
      onClick: () => console.log('Editando:', row.id) 
    },
    { separator: true },
    { 
      label: 'Eliminar', 
      icon: 'delete', 
      color: '#ef4444', // Color rojo para acción destructiva
      onClick: () => console.log('Eliminando:', row.id) 
    }
  ]

const misColumnas = [
  { key: "name", header: "Name" },
  { key: "date", header: "Date" },
  { 
    key: "status", 
    header: "Status",
    // Ejemplo de cómo puedes personalizar una celda específica sin tocar el componente principal
    render: (status) => (
      <span style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        backgroundColor: status === 'completed' ? '#dcfce7' : '#fef3c7',
        color: status === 'completed' ? '#166534' : '#92400e'
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  },
  { key: "amount", header: "Amount" },
  { 
    key: "", 
    header: "", // Lo dejamos vacío para que quede limpio como en Shadcn
    render: (_, row) => <ChangeRequestRowActions row={row} menuItems={menuItems} /> 
  }
];



export function Ingenieria(){
    const {solicitudes,
        loadingRequests,
        page,
        setPage,
        refreshRequests} = useChangeRequest();

    return(
        <>
            <NavBar />
            <div className="body-container">
                <Table data={misDatos} columns={misColumnas}/>
            </div>
        </>

    );
}