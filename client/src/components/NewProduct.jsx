//Componentes
import React from "react";

//Estilos
import "../styles/NewProduct.css"
import NewPieza from "./NewPieza";

class NewProduct extends React.Component{
    
    //Constructor
    constructor(props){
        super(props);
        this.state = {
            nombre: "",   // estado local para el input
            piezas:[{}]
        };
    }

    handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    };

    handleCreate = () => {
        if (this.state.nombre.trim() !== "") {
            this.props.onCreate(this.state);  // pasamos todo el producto con sus piezas
            this.setState({ nombre: "", piezas: [{}] }); // limpiar
        }
    }

    handlePartChange = (part, key)=>{
        this.setState( (prevState)=>{
            const newPiezas = [...prevState.piezas];   // copiamos el array
            newPiezas[key] = part;
            return { piezas: newPiezas }; 
        })   
    }
    
   
    addPart = () => {
        this.setState(prevState => ({
            piezas: [...prevState.piezas, {}]  // 👈 agregamos un nuevo objeto vacío
        }));
    };
    
    //Render
    render(){
        return(
        <>
        <div className="overlay">
            <div className="modal">
                <div>
                    <h2>Agregar Producto</h2>
                    <div>Nombre del producto:</div>
                    <input type="text" name="nombre"  value={this.state.nombre} onChange={this.handleChange}/>
                </div>
                <hr/> 
                {this.state.piezas.map((pieza, index) => (
                    <NewPieza key={index} index={index} data={pieza} onChange={this.handlePartChange}/>
                ))}
                <button onClick={this.addPart}>Agregar pieza</button>
                <div className="buttons">
                    <button className="cancel" onClick={this.props.onClose} >Cancelar</button>
                    <button className="create" onClick={this.handleCreate}>Crear</button>
                </div>
            </div>
        </div>
        </>)
    }
}

export default NewProduct;