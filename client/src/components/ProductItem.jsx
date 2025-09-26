//Componentes
import React from "react";

//Estilos
import "../styles/ProductItem.css"

class ProductItem extends React.Component{
    
    //constructor
    constructor(props){
        super(props)
    }

    //Método para llamar a la API al hacer click

    //Render
    render(){
        return (
            <>
            <div className='product-item'>
                <div className='product-name'>
                    <i className="material-icons">folder</i>
                    <span>{this.props.name}</span>
                </div>
                <i className="material-icons more-icon">more_vert</i>
            </div>
            </>
        );
    }
}

export default ProductItem;