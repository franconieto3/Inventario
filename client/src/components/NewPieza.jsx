//Componentes
import React from "react";

//Estilos
import "../styles/NewPieza.css"

class NewPieza extends React.Component{
    //Constructor
    constructor(props){
        super(props);
        this.state ={
            codigoPieza: props.data?.codigoPieza || "",
            nombrePieza: props.data?.nombrePieza || ""
        }
    }

    //Metodos
    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value }, () => {
            // avisamos al padre con los datos actualizados y el index
            this.props.onChange(this.state, this.props.index);
        });
    };

    //Render
    render(){
        return(
            <>
            <div>
                <div>Código de pieza:</div>
                <input type="number" name="codigoPieza" value={this.state.codigoPieza} onChange={this.handleChange}/>
                <div>Nombre de la pieza:</div>
                <input type="text" name="nombrePieza"  value={this.state.nombrePieza} onChange={this.handleChange}/>
                <hr/> 
            </div>
            </>
        );
    }
}

export default NewPieza;