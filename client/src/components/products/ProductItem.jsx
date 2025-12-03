//Componentes
import React from "react";

//Estilos
import "../../styles/ProductItem.css"

export default function ProductItem( {id, name, onChange} ){

    //Método para llamar a la API al hacer click

    return(
        <>
        <div className='product-item' onClick={()=>{onChange(id)}}>
            <div className='product-name'>
                <i className="material-icons">folder</i>
                <span>{name}</span>
            </div>
            <i className="material-icons more-icon" onClick={(e)=>{
                e.stopPropagation();
            }}>more_vert</i>
        </div>
        </>
    );
}
