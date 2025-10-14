// NewPieza.jsx
import React from "react";
import "../styles/NewPieza.css";

function NewPieza({ id, data = {}, onChange, onDelete }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    // enviar al padre el objeto actualizado (no mutar data)
    onChange({ ...data, [name]: value }, id);
  };

  return (
    <>
      <div className="new-part-box">
        <div>
          <div>Código de pieza:</div>
          <input
            type="number"
            name="codigoPieza"
            value={data.codigoPieza ?? ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <div>Descripción:</div>
          <input
            type="text"
            name="nombrePieza"
            value={data.nombrePieza ?? ""}
            onChange={handleChange}
          />
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
