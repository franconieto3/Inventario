import { useEffect, useState } from 'react';

import "../../styles/ProductDetail.css"

export function PartDetail({nombreProducto, idPieza, nombrePieza}){

    const [mostrar, setMostrar] = useState(false);
    
    return(
        <div className='detail'>
            <div className='detail-subtitle'>
                <input type='checkbox' name="Piezas" onChange={()=>setMostrar(!mostrar)} checked={mostrar}/>
                <span>{nombreProducto + " " + nombrePieza}</span>
            </div>
        </div> 
    );
}