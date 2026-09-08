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
            <div className="ui-card">
                <div className="ui-card-header">
                    <h3 className="ui-card-title">Órdenes de fabricación</h3>
                    <p className="ui-card-description">Resumen de piezas requeridas y materia prima asignada.</p>
                </div>
                <div className="ui-card-content">
                    <Table data={ordenes} columns={COLUMNAS_ORDEN} padding="0px" />
                </div>
            </div>

            {/* Sección 2: Detalle por cada pieza */}
            <div className="detalle-piezas-section">
                <h3 className="section-title">Información auxiliar de piezas</h3>
                <div>
                    {ordenes.map((orden) => (
                        <div key={orden.id_of || orden.pieza?.id_pieza} className="ui-card">
                            <div className="ui-card-content pt-4">
                                <PartDetail
                                    idPieza={orden.pieza?.id_pieza}
                                    nombrePieza={orden.pieza?.nombre}
                                    codigoPieza={orden.pieza?.codigo_produccion}
                                    producto={producto}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}