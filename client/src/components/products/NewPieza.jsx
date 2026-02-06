// NewPieza.jsx
import React, { useState } from "react";
import "../../styles/NewPieza.css";

function NewPieza({ id, data = {}, onChange, onDelete, rubro, producto }) {

  const handleChange = (e) => {
    const { name, value } = e.target;
    // enviar al padre el objeto actualizado (no mutar data)

    if (name === "codigoPieza") {
       onChange({
        ...data,
        codigoPiezaRaw: value,
      }, id);
    }
    else if(name === "nombrePieza"){
      onChange({ ...data, "nombrePieza": value }, id)
    }
    
  };

  return (
    <>
      <div className="new-part-box">
        <div style={{"display":"block"}}>
          <div className="input-codigo">
            <div >Código de pieza: </div>
            <div className="input-wrapper">
              <span className="prefix">{String(rubro).padStart(2, "0")} -</span>
              <input
                className="input-number"
                type="number"
                name="codigoPieza"
                min="1" 
                step="1" 
                value={data.codigoPiezaRaw}
                onChange={handleChange}
              />
              <span className="suffix">- XX</span>
            </div>
          </div>

            <div className="input-descripcion">
              <span>Descripción: {" " + producto}</span>
              <input
                className="input-text"
                type="text"
                name="nombrePieza"
                value={data.nombrePieza ?? ""}
                onChange={handleChange}
              />
            </div>
        </div>
        <div className="delete" onClick={() => onDelete(id)}>
          <i className="material-icons">delete</i>
        </div>
      </div>
      <hr />
    </>
  );
}

export default NewPieza;
