// Componentes
import React from "react";
import ProductItem from "./ProductItem";
import NewProduct from "./NewProduct";
import logo from '../assets/logo.png';

//Estilos
import "../styles/ProductSection.css"

//Simulación de datos extraidos del backend
const listadoPM = [{id: "0", nombre: "Ninguno"}, {id: "1", nombre: "Cadera"}, {id: "2", nombre: "Clavos endomedulares"}]

const listadoRubros = [{id: "0", nombre: "Ninguno"},
                       {id: "1", nombre: "Tallo"},
                       {id: "2", nombre: "Cotilo"}, 
                       {id: "3", nombre: "Tornillo Ø2.0"}, 
                       {id: "4", nombre: "Tornillo Ø2.5"},
                       {id: "5", nombre: "Tornillo Ø2.7",},
                       {id: "6", nombre: "Tornillo Ø3.5"},
                       {id: "7", nombre: "Tornillo Ø4.0"},
                       {id: "8", nombre: "Tornillo Ø4.5"},
                       {id: "9", nombre: "Tornillo Ø5.0"},
                       {id: "10", nombre: "Arpón de titanio"},
                       {id: "11", nombre: "Arpón de peek"},
                       {id: "12", nombre: "Componente de fábrica"},
                    ]

const listadoProductos = [{nombre:"Tallo Charnley", piezas:[{}]}, 
                        {nombre:"Cotilo Muller", piezas:[{}]},
                        {nombre:"Tallo Thopmson", piezas:[{}]},
                        {nombre:"Cotilo no cementado", piezas:[{}]}]

class ProductSection extends React.Component{

    //Constructor
    constructor(props){
        super(props);
        this.state = {
            productos: listadoProductos,
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
            <div className='logo-container'>
                <img className="logo-img" src={logo} alt="logo"></img>
                <span className='logo-text'>BIOPROTECE S.A.</span>
            </div>
            <div className='title-container'>
                <div>
                <p className='products-text'>Productos</p>
                <p className='products-count'>21 productos</p>
                </div>
            </div>

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
                <NewProduct onClose={this.handleCloseNewProduct} onCreate={this.handleAddProduct} registros = {listadoPM} rubros = {listadoRubros}/>
            )}
            </>
        );
    }
}

export default ProductSection;
