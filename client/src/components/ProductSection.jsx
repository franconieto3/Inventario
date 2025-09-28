// Componentes
import React from "react";
import ProductItem from "./ProductItem";
import NewProduct from "./NewProduct";

//Estilos
import "../styles/ProductSection.css"

class ProductSection extends React.Component{

    //Constructor
    constructor(props){
        super(props);
        this.state = {
            productos: [{nombre:"Tallo Charnley", piezas:[{}]}, 
                        {nombre:"Cotilo Muller", piezas:[{}]},
                        {nombre:"Tallo Thopmson", piezas:[{}]},
                        {nombre:"Cotilo no cementado", piezas:[{}]}],
            showNewProduct: false
        }
    }
    // Mostrar modal
    handleShowNewProduct = () => {
        this.setState({ showNewProduct: true });
    }

    // Ocultar modal
    handleCloseNewProduct = () => {
        this.setState({ showNewProduct: false });
    }

    handleAddProduct = (nuevoProducto) => {
        this.setState((prevState) => ({
            productos: [...prevState.productos, nuevoProducto],
            showNewProduct: false  // de paso cerramos el modal
        }));
    }

    //Render
    render(){   
        const items = this.state.productos.map((item) =>{return (<ProductItem name={item.nombre}/>) });
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
                    <button className='add-button' onClick={this.handleShowNewProduct}>Agregar producto</button>
                </div>
            </div>

            <div className='product-list'>
                <div className='product-list-header'>Nombre</div>
                {items}
            </div>

            {/* 👇 Render condicional */}
            {this.state.showNewProduct && (
                <NewProduct onClose={this.handleCloseNewProduct} onCreate={this.handleAddProduct}/>
            )}
            </>
        );
    }
}

export default ProductSection;
