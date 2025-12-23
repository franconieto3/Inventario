// NewProduct.jsx
import "../../styles/NewProduct.css";
import BuscadorRubros from "../BuscadorRubros";
import NewPieza from "./NewPieza";
import { useState } from "react";

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;


export default function NewProduct(props) {
  const [nombre, setNombre] = useState("");
  const [pm, setPm] = useState(0);
  const [rubro, setRubro] = useState(0);
  const [piezas, setPiezas] = useState([{ id: genId(),codigoPiezaRaw:"", codigoPieza: "", nombrePieza: "" }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nombre") setNombre(value);
    else if (name === "pm") setPm(value);
    else if (name === "rubro") setRubro(value);
  };

  const handleCreate = () => {
    if (nombre.trim() === "") {
        setError("El nombre del producto es obligatorio.");
        return;
    }
    // Validar que haya al menos una pieza si es requisito
    if (piezas.length === 0) {
        setError("Debe agregar al menos una pieza.");
        return;
    }

    //Se verifica que cada pieza tenga una denominación y sea única
    if(piezas.length > 1){
      //Falta de denominación
      if (piezas.some(p => !p.nombrePieza)) {
        setError("Hay al menos una pieza sin denominación");
        return;
      }

      //Duplicados
      const nombres = piezas.map(p => p.nombrePieza);
      if (new Set(nombres).size !== nombres.length) {
        setError("Hay al menos dos piezas con la misma denominación");
        return;
      }
    }

    // 2. Preparar el Payload Único
      const payload = {
          nombre: nombre,
          id_registro_pm: pm,
          id_rubro: rubro,
          piezas: piezas.map(p => {
              let codigoFinal = null;

              // Solo si el usuario escribió algo en el input 'raw', lo formateamos
              if (p.codigoPiezaRaw && p.codigoPiezaRaw.trim() !== "") {
                  codigoFinal = 
                      String(rubro).padStart(2, "0") +
                      "-" +
                      p.codigoPiezaRaw.padStart(3, "0") +
                      "-XX";
              }

              return {
                  nombre: p.nombrePieza,
                  codigo_am: codigoFinal // Será el código formateado O null
              };
          })
      };

    setLoading(true);
    
    // Enviamos la "entidad" tal como estaba en la versión de clase
    //props.onCreate({ nombre, pm, rubro, piezas });
    props.onCreate(payload);
    setNombre("");
    setPiezas([{ id: genId(), codigoPieza: "", nombrePieza: "" }]);
    setPm(0);
    setRubro(0);
  };

  const handlePartChange = (part, id) => {
    setPiezas(prev => prev.map(p => (p.id === id ? { ...p, ...part, id } : p)));
  };

  const addPart = () => {
    setPiezas(prev => [...prev, { id: genId(), codigoPieza: "", nombrePieza: "" }]);
  };

  const deletePart = (id) => {
    setPiezas(prev => {
      if (prev.length <= 1) return prev; // si hay 1 o menos, no eliminar (mismo comportamiento lógico)
      return prev.filter(p => p.id !== id);
    });
  };

  return (
    <>
      <div className="overlay">
        <div className="modal">
          <div>
            <label>Nombre del producto:</label>
            <input type="text" placeholder="Nombre del producto..." name="nombre" value={nombre} onChange={handleChange} />

            <label>
              Registro de producto médico:
            </label>
            <BuscadorRubros
              opciones={props.registros}
              placeholder="Buscar registro de PM..."
              keys={['id_registro_pm','descripcion']}
              onChange={(id)=>setPm(id)}
              idField="id_registro_pm"
              displayField="descripcion"
            />
            
            <label>Especificar rubro:</label>
            <BuscadorRubros 
              opciones={props.rubros} 
              placeholder="Buscar rubros..." 
              keys={['id_rubro', 'descripcion']} 
              onChange={(id)=>setRubro(id)} 
              idField="id_rubro" 
              displayField="descripcion"
            />
          </div>
          

          <hr />
          {piezas.map((pieza) => (
            <NewPieza
              key={pieza.id}
              id={pieza.id}
              data={pieza}
              onChange={handlePartChange}
              onDelete={deletePart}
              rubro={rubro}
              producto={nombre}
            />
          ))}
          <button onClick={addPart}>Agregar pieza</button>

          {error && (<p className="error-message" style={{ color: "red" }}> {error} </p>)}

          <div className="buttons">
            <button className="cancel" onClick={props.onClose}>Cancelar</button>
            <button className="create" onClick={handleCreate}>Crear</button>
          </div>
        </div>
      </div>
    </>
  );
}


