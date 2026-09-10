import { useParams } from "react-router-dom";
import { useValidacionDocumento } from "./hooks/useValidacionDocumento";
import { Spinner } from "../../components/ui/Spinner";
import Table from "../../components/ui/Table";
import formatearCodigo from "../../services/formatearCodigo";
import "./ValidacionDocumento.css";

const columnas = [
    {
        key: "nombre",
        header: "Pieza",
        render: (_, row) => `${row.producto?.nombre ?? ''} ${row.nombre ?? ''}`.trim()
    },
    {
        key: "codigo_produccion",
        header: "Código",
        render: (_, row) => formatearCodigo(row.producto?.id_rubro, row.codigo_produccion)
    },
];

export default function ValidacionDocumento() {
    const { id } = useParams();
    const { data, loading, error } = useValidacionDocumento(id);

    return (
        <div className="validacion-doc-layout">
            <div className="validacion-doc-card">
                {loading && (
                    <Spinner size={40} color="#64748b" center label="Validando documento..." />
                )}

                {!loading && error && (
                    <>
                        <div className="validacion-doc-badge error">Error</div>
                        <p className="validacion-doc-descripcion">{error}</p>
                    </>
                )}

                {!loading && !error && data && (
                    <>
                        <div className={`validacion-doc-badge ${data.vigente ? 'vigente' : 'obsoleto'}`}>
                            {data.vigente ? 'Documento vigente' : 'Documento obsoleto'}
                        </div>

                        {data.vigente ? (
                            <>
                                <p className="validacion-doc-descripcion">
                                    Esta versión es la vigente para las siguientes piezas:
                                </p>
                                <Table data={data.piezas} columns={columnas} />
                            </>
                        ) : (
                            <p className="validacion-doc-descripcion">
                                Esta copia ya no corresponde a la versión vigente del documento.
                                Se recomienda descartarla.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
