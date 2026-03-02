import { useState } from "react";
import { apiCall } from "../../../../../services/api";
import { DropdownMenu } from "../../../../../components/ui/DropdownMenu";
import formatearCodigo from "../../../../../services/formatearCodigo";
import EdicionPieza from "../../EdicionPieza";
import Can from "../../../../../components/Can";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartHeader({ mostrar, setMostrar, idPieza, nombrePieza, codigoPieza, producto, onRefreshParent, onPartUpdated }) {
    const [menuPiezaOpen, setMenuPiezaOpen] = useState(false);
    const [mostrarEdicion, setMostrarEdicion] = useState(false);

    const abrirModalEdicion = () => {
        setMostrarEdicion(true);
        setMenuPiezaOpen(false);
    };

    const handleEliminarPieza = async () => {
        if (window.confirm("¿Seguro que deseas eliminar esta pieza?")) {
            try {
                await apiCall(`${API_URL}/api/productos/pieza/eliminacion/${idPieza}`, { method: 'DELETE' });
                if (onRefreshParent) onRefreshParent();
            } catch (err) {
                alert("Ocurrió un error: " + err.message);
            }
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className='part-title'>
                    <input 
                        type='checkbox' 
                        name="Piezas" 
                        onChange={() => setMostrar(!mostrar)} 
                        checked={mostrar} 
                    />
                    <span>{producto.nombre} {nombrePieza} · Código: {formatearCodigo(producto.id_rubro, codigoPieza)}</span>
                </div>
                
                <Can permission="administrar_productos">
                    <DropdownMenu
                        isOpen={menuPiezaOpen}
                        onToggle={() => setMenuPiezaOpen(!menuPiezaOpen)}
                        items={[
                            { label: 'Editar pieza', icon: 'edit', onClick: abrirModalEdicion },
                            { label: 'Eliminar pieza', icon: 'delete', color: 'red', onClick: handleEliminarPieza }
                        ]}
                    />
                </Can>
            </div>

            {/* Modal de edición aislado */}
            {mostrarEdicion && 
                <EdicionPieza 
                    idPieza={idPieza}
                    producto={producto} 
                    nombreInicial={nombrePieza} 
                    codigoInicial={codigoPieza} 
                    onClose={() => setMostrarEdicion(false)} 
                    onUploadSuccess={() => {
                        setMostrarEdicion(false); 
                        onPartUpdated(); // Refresca los datos en usePartDetail
                        if (onRefreshParent) onRefreshParent();
                    }}
                />
            }
        </>
    );
}