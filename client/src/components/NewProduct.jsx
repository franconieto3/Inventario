// NewProduct.jsx
import React from "react";
import "../styles/NewProduct.css";
import NewPieza from "./NewPieza";

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

class NewProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nombre: "",
      pm: "0",
      rubro: "0",
      piezas: [{ id: genId(), codigoPieza: "", nombrePieza: "" }]
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleCreate = () => {
    if (this.state.nombre.trim() !== "") {
      this.props.onCreate(this.state);
      this.setState({ nombre: "", piezas: [{ id: genId(), codigoPieza: "", nombrePieza: "" }] });
    }
  };

  handlePartChange = (part, id) => {
    this.setState((prevState) => ({
      piezas: prevState.piezas.map(p => (p.id === id ? { ...p, ...part, id } : p))
    }));
  };

  addPart = () => {
    this.setState(prevState => ({
      piezas: [...prevState.piezas, { id: genId(), codigoPieza: "", nombrePieza: "" }]
    }));
  };

  deletePart = (id) => {
    this.setState(prevState => {
      if (prevState.piezas.length <= 1) return null;
      return { piezas: prevState.piezas.filter(p => p.id !== id) };
    });
  };

  render() {
    console.log(this.state)
    return (
      <>
        <div className="overlay">
          <div className="modal">
            <div>
              <h2>Nuevo Producto</h2>
              <div>Nombre del producto:</div>
              <input type="text" name="nombre" value={this.state.nombre} onChange={this.handleChange} />

              <div>Registro de producto médico:</div>
              <select name="pm" value={this.state.pm} id="pm" onChange={this.handleChange}>
                {this.props.registros.map(item => (<option key={item.id} value={item.id}>{item.nombre}</option>))}
              </select>

             <div>Especificar rubro:</div>
                <select name="rubro" value={this.state.rubro} id="rubro" onChange={this.handleChange}>
                    {this.props.rubros.map(item => (<option key={item.id} value={item.id}>{item.nombre}</option>))}
                </select>
            </div>

            
            <hr />
            {this.state.piezas.map((pieza) => (
              <NewPieza
                key={pieza.id}
                id={pieza.id}
                data={pieza}
                onChange={this.handlePartChange}
                onDelete={this.deletePart}
              />
            ))}
            <button onClick={this.addPart}>Agregar pieza</button>

            <div className="buttons">
              <button className="cancel" onClick={this.props.onClose}>Cancelar</button>
              <button className="create" onClick={this.handleCreate}>Crear</button>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default NewProduct;
