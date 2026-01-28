import { useEffect, useState } from 'react';
import "../../styles/ProductDetail.css"
import { apiCall } from '../../services/api';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function PartDetail({ nombreProducto, idPieza, nombrePieza }) {

    const [mostrar, setMostrar] = useState(false);
    const [pieza, setPieza] = useState(null);
    const [loading, setLoading] = useState(false); // Opcional: para feedback visual

    useEffect(() => {
        const fetchPart = async () => {
            setLoading(true);
            console.log("Enviando petición");
            try {
                const data = await apiCall(`${API_URL}/api/productos/pieza/${idPieza}`,{});
                setPieza(data);
            } catch (err) {
                console.error(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (mostrar && idPieza) {
            fetchPart();
        }
    }, [mostrar, idPieza]); // CORRECCIÓN: Agregado idPieza a dependencias


    useEffect(()=>{console.log(pieza)},[pieza]);

    const handleVerPlano = async (pathArchivo) => {
        try {
            const {signedUrl} = await apiCall(`${API_URL}/api/documentos/obtener-url-plano`, {method:'POST', body:JSON.stringify({ path: pathArchivo })});
            window.open(signedUrl, '_blank');

        } catch (err) {
            alert(err.message); // O usa un estado setError para mostrarlo bonito
        }
    };

    return (
        <>
            <div className='detail'>
                <div className='detail-subtitle'>
                    <input 
                        type='checkbox' 
                        name="Piezas" 
                        onChange={() => setMostrar(!mostrar)} 
                        checked={mostrar} 
                    />
                    <span>{nombreProducto + " " + nombrePieza}</span>
                </div>
                {mostrar && (
                    <div className="pieza-info">
                        {loading && <p>Cargando...</p>}
                        
                        {!loading && pieza && (
                            <>
                                <div>
                                    <p>
                                    Código comercial: {`${pieza.codigo_am}`}
                                    </p>
                                </div>
                                <div>
                                    <p>Documentos: </p>
                                    {pieza.documentos? pieza.documentos.map((d)=>(
                                        <a                         
                                        onClick={() => handleVerPlano(d.path)} 
                                        style={{
                                        cursor: 'pointer', 
                                        color: 'blue', 
                                        textDecoration: 'underline'
                                        }}>
                                            Ver {d.descripcion}
                                        </a>)) 
                                        : null}
                                </div>  
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}