// Componentes
import React from "react";
import ProductItem from "./ProductItem";

//Estilos
import "../styles/ProductSection.css"

class ProductSection extends React.Component{

    //Constructor
    constructor(props){
        super(props);
        this.state = {
            productos: ["Tallo Charnley", "Cotilo Muller", "Tallo Thopmson", "Cotilo no cementado"]
        }
    }

    //Render
    render(){   
        const items = this.state.productos.map((item) =>{return (<ProductItem name={item}/>) });
        return (
            <>
            <div className='filters'>
                <div className='search-box'>
                    <input type='text' placeholder="Buscar productos..." />
                    <button className='btn-search'>
                        <span className="material-icons">search</span>
                    </button>
                </div>
                <div className='button-container'>
                    <button className='add-button'>Agregar categoría</button>
                    <button className='add-button'>Agregar producto</button>
                </div>
            </div>

            <div className='product-list'>
                <div className='product-list-header'>Nombre</div>
                {items}
            </div>
            </>
        );
    }
}

export default ProductSection;
