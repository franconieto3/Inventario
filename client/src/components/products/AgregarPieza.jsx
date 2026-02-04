import {useState, useEffect} from 'react'

export function AgregarPieza({producto, onUploadSuccess}){

    const [agregarPieza, setAgregarPieza] = useState(false);

    //Estados de formulario
    const [codigo, setCodigo] = useState("");
    const [nombrePieza, setNombrePieza] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(()=>{
        console.log(producto);
    },[])

    const handleSubmit = async ()=>{
        try{
            setLoading(true)
            const payload = {
                nombrePieza: nombrePieza,
                codigoAm: codigo,
                idProducto: producto.id_pruducto
            }
            const respuesta = await apiCall(`${API_URL}/api/documentos/guardar-documento`, {method: 'POST', body: JSON.stringify(payload)});
            
            alert("Pieza creada exitosamente.");
            setAgregarPieza(false);

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        }catch(err){
            setError(err.message);
        }
    }

    return(
        <>
        {!agregarPieza &&
        <div className='add-span' onClick={()=>setAgregarPieza(true)}>
            <i className='material-icons' id="add-icon">add</i>
            <h3 style={{"fontSize":"1rem"}}>Agregar pieza</h3>
        </div>
        }
        {agregarPieza &&
        <div className='overlay'>
            <div className='modal'>
                <div style={{'display':'flex', "gap":"8px"}}>
                    <i className='material-icons' id='close-button' onClick={()=>setAgregarPieza(false)}>close</i>
                    <div>
                        <h3 style={{"fontSize":"1rem", "textAlign":'start'}}>Agregar nueva pieza</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="input-codigo">
                                <div>Código de pieza: </div>
                                <div className="input-wrapper">
                                    <span className="prefix">{String(producto.id_rubro).padStart(2, "0")} - </span>
                                    <input
                                        className="input-number"
                                        type="number"
                                        name="codigoPieza"
                                        min="1" 
                                        step="1" 
                                        value={codigo}
                                        onChange={()=>setCodigo(e.target.value)}
                                    />
                                    <span className="suffix">- XX</span>
                                </div>
                            </div>
                            <div className="input-descripcion">
                                <span>{producto.nombre}</span>
                                <input
                                    placeholder='Descripción...'
                                    className="input-text"
                                    type="text"
                                    name="nombrePieza"
                                    value={nombrePieza}
                                    onChange={()=>setNombrePieza(e.target.value)}
                                />
                            </div>
                            <button type="submit" disabled={loading?true:false}>Guardar</button>
                            {error && <p>{error}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
        }
        </>
    );
}