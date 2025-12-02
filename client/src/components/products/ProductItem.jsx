//Componentes
import React from "react";

//Estilos
import "../../styles/ProductItem.css"

export default function ProductItem( {name} ){

    //Método para llamar a la API al hacer click

    return(
        <>
        <div className='product-item'>
            <div className='product-name'>
                <i className="material-icons">folder</i>
                <span>{name}</span>
            </div>
            <i className="material-icons more-icon">more_vert</i>
        </div>
        </>
    );
}
