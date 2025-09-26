//Componentes
import React from "react";

//Estilos
import "../styles/NewProduct.css"

class NewProduct extends React.Component{
    
    //Constructor
    constructor(props){
        super(props);
    }

    //Render
    render(){
        return(
        <>
        <div className="overlay">
            <div className="modal">
                <h2>Nuevo Producto</h2>
                <input type="text"/>
                <div className="buttons">
                    <button className="cancel">Cancelar</button>
                    <button className="create">Crear</button>
                </div>
            </div>
        </div>
        </>)
    }
}

export default NewProduct;