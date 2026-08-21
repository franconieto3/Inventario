import NavBar from "../../../components/layout/NavBar";
import Buscador from "../../../components/ui/Buscador";
import Button from "../../../components/ui/Button";
import { useGenerarOrdenFabricacion } from "../hooks/useGenerarOrdenFabricacion";
import "./GenerarOrdenFabricacion.css";

export default function GenerarOrdenFabricacion() {
    const {
        productos,
        loadingProductos,
        producto,
        piezasState,
        loadingPiezas,
        errorPiezas,
        submitting,
        submitError,
        seleccionarProducto,
        actualizarCantidad,
        actualizarAMedida,
        submitOrdenes
    } = useGenerarOrdenFabricacion();

    const handleSubmit = async () => {
        const data = await submitOrdenes();
        if (data) {
            alert(`Se generaron ${data.ordenes.length} órdenes de fabricación exitosamente.`);
        }
    };

    return (
        <>
            <NavBar />
            <div className="body-container">
                <h1>Nueva orden de fabricación</h1>

                <Buscador
                    opciones={productos}
                    placeholder={loadingProductos ? "Cargando productos..." : "Buscar producto"}
                    keys={['nombre']}
                    onChange={(id) => seleccionarProducto(id)}
                    idField="id_producto"
                    displayField="nombre"
                    showId={false}
                />

                {loadingPiezas && (
                    <p className="loading-state">Cargando piezas del producto...</p>
                )}

                {!loadingPiezas && errorPiezas && (
                    <p className="form-error">{errorPiezas}</p>
                )}

                {!loadingPiezas && producto && (
                    <div className="of-piezas-container">
                        <h2>{producto.nombre}</h2>

                        {(!producto.pieza || producto.pieza.length === 0) ? (
                            <p className="empty-state">Este producto no tiene piezas activas.</p>
                        ) : (
                            <ul className="of-pieza-list">
                                {producto.pieza.map((p) => (
                                    <li key={p.id_pieza} className="of-pieza-item">
                                        <span className="of-pieza-name">
                                            {p.nombre}
                                            {p.es_ensamble && (
                                                <span className="of-pieza-badge">Ensamble</span>
                                            )}
                                        </span>

                                        <div className="of-pieza-actions">
                                            <label className="of-pieza-field">
                                                Cantidad
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="shadcn-input"
                                                    value={piezasState[p.id_pieza]?.cantidad ?? 0}
                                                    onChange={(e) => actualizarCantidad(p.id_pieza, e.target.value)}
                                                />
                                            </label>

                                            <label className="of-pieza-field of-pieza-checkbox">
                                                A medida
                                                <input
                                                    type="checkbox"
                                                    checked={piezasState[p.id_pieza]?.a_medida ?? false}
                                                    onChange={(e) => actualizarAMedida(p.id_pieza, e.target.checked)}
                                                />
                                            </label>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {submitError && <p className="form-error">{submitError}</p>}
                        <div style={{width:'100%', marginTop:'50px', textAlign:'end'}}>
                            <Button variant="default" disabled={submitting} onClick={handleSubmit}>
                                {submitting ? "Generando..." : "Generar Órdenes"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
