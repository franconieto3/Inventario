import { useState } from "react";
import "./OrderCard.css";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";

export function OrderCard({ orden, seleccionada, actualizando, onToggleSeleccion, onGuardarOrdenProduccion }) {
   
    const [idOrdenProduccion, setIdOrdenProduccion] = useState(orden.id_orden_produccion || "");
    const [expandida, setExpandida] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const deshabilitado = actualizando === orden.id_of;

    return (
        <div 
            className={`order-card ${seleccionada ? "order-card-seleccionada" : ""}`}
            onClick={() => setExpandida(!expandida)}
            style={{ cursor: "pointer" }} // Añade un cursor interactivo
        >
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <div className="order-card-header">
                    <label className="order-card-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={seleccionada}
                            onChange={() => onToggleSeleccion(orden.id_of)}
                        />
                        <span>#{orden.id_of}</span>
                    </label>
                    {orden.id_of_padre && <span className="order-card-badge">Hija de #{orden.id_of_padre}</span>}
                    {orden.a_medida && <span className="order-card-badge order-card-badge-medida">A medida</span>}
                </div>

                <p className="order-card-titulo">
                    {orden.pieza?.producto?.nombre} {orden.pieza?.nombre}
                </p>
                <div onClick={(e)=>e.stopPropagation()}>
                    <DropdownMenu
                        isOpen={menuOpen}
                        onToggle={()=>setMenuOpen(!menuOpen)}
                        items={[{
                            label: 'Cancelar orden',
                            icon: 'cancel',
                            color:'red',
                            permission: 'cancelar_orden_fabricacion',
                            onClick: ()=> console.log("Cancelando orden")
                        }]}
                    ></DropdownMenu>
                </div>
            </div>
            {/* Renderizado condicional: Solo se muestra si "expandida" es true */}
            {expandida && (
                <>
                    <div className="order-card-detalle">
                        <span>Cantidad: <strong>{orden.cantidad}</strong></span>
                        <span>Ruta: <strong>{orden.ruta_procesos?.nombre || "- - -"}</strong></span>
                        <span>Materia prima: <strong>{orden.id_materia_prima || "- - -"}</strong></span>
                    </div>

                    {/* Agregamos stopPropagation al contenedor del input y botón */}
                    <div className="order-card-orden-produccion" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="text"
                            className="shadcn-input"
                            placeholder="ID orden de producción"
                            value={idOrdenProduccion}
                            disabled={deshabilitado}
                            onChange={(e) => setIdOrdenProduccion(e.target.value)}
                        />
                        <button
                            disabled={deshabilitado || !idOrdenProduccion || idOrdenProduccion === orden.id_orden_produccion}
                            onClick={() => onGuardarOrdenProduccion(orden.id_of, idOrdenProduccion)}
                        >
                            Guardar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}