export function DetalleRuta({ruta}){
    return (
        <>
            <div>
                {
                    ruta?.proceso_bop?.map(
                        (item)=>(
                            <div 
                                key={item.id_proceso_ruta} 
                                className="ruta-item"
                            >
                                <div className="ruta-item-info">
                                    <span className="step-number">{item.orden_secuencia}</span>
                                    <span className="step-name">{item.proceso?.nombre}</span>
                                    {
                                    item.requiere_inspeccion?
                                        <span style={{display:'flex',alignItems:'center'}}>
                                            <i className="material-icons" style={{fontSize:'1.2rem', color:'grey'}}>visibility</i>
                                        </span>
                                    :<></>
                                    }
                                </div>
                            </div>
                        )
                    )
                }
            </div>
        </>
    );
}