import Table from "../../../components/ui/Table";
import { PartDetail } from "../../products/components/PartDetail/PartDetail";

export function RepositorioPieza({ ordenes = [], producto }) {
    const COLUMNAS_ORDEN = [
        { key: 'pieza', header: 'Pieza', render: (_, orden) => producto.nombre + " " + orden.pieza?.nombre },
        { key: 'cantidad', header: 'Cantidad' },
        {
            key: 'materiaPrima',
            header: 'Materia prima',
            render: (_, orden) => (orden.orden_fabricacion_materia_prima || []).map(m => m.identificador).join(', ') || "- - -"
        },
        { key: 'id_orden_produccion', header: 'O. de Producción', render: (v) => v || "- - -" }
    ];

    return (
        <div className="repositorio-pieza-container">
            {/* Sección 1: Tabla general de órdenes */}
            <div>
                <h3 className="ui-card-title" style={{marginBottom:'20px'}}>Órdenes de fabricación</h3>
                <Table data={ordenes} columns={COLUMNAS_ORDEN} padding="60px" />
            </div>

            {/* Sección 2: Detalle por cada pieza */}
            <div className="detalle-piezas-section">
                <h3 className="section-title">Información auxiliar de piezas</h3>
                <div>
                    {ordenes.map((orden) => (
                        <div key={orden.id_of || orden.pieza?.id_pieza}>
                                <PartDetail
                                    idPieza={orden.pieza?.id_pieza}
                                    nombrePieza={orden.pieza?.nombre}
                                    codigoPieza={orden.pieza?.codigo_produccion}
                                    producto={producto}
                                />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}