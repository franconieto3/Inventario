import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { PartMaterials } from "../../products/components/PartDetail/components/PartMaterials";
import { usePartMaterials } from "../hooks/usePartMaterials";

export function DetalleMaterialesPieza({ pieza }) {
    const [abierto, setAbierto] = useState(false);
    const { materiales, loading, fetchMateriales } = usePartMaterials(pieza?.id_pieza);

    const handleAbrir = () => {
        setAbierto(true);
        fetchMateriales();
    };

    if (!pieza?.id_pieza) return null;

    return (
        <>
            <Button variant="secondary" size="icon" onClick={handleAbrir} title="Ver materiales de la pieza">
                <i className="material-icons" style={{ fontSize: '18px' }}>grid_view</i>
            </Button>

            {abierto && (
                <Modal
                    titulo="Materiales"
                    descripcion={`${pieza.producto?.nombre || ''} ${pieza.nombre || ''}`}
                    onClose={() => setAbierto(false)}
                >
                    {loading || materiales === null ? (
                        <p className="loading-state">Cargando materiales...</p>
                    ) : (
                        <PartMaterials
                            pieza={{ ...pieza, materiales }}
                            producto={pieza.producto}
                            onRefresh={fetchMateriales}
                        />
                    )}
                </Modal>
            )}
        </>
    );
}
