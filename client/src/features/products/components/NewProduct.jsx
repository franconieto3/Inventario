import { useState } from "react";

import Buscador from "../../../components/ui/Buscador";
import { apiCall } from "../../../services/api";
import NewPieza from "./NewPieza";

import "./NewProduct.css";

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';


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

  const handleCreate = async () => {
    setError("");

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

      //Nombres duplicados
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
           return{
            nombre: p.nombrePieza,
            codigo: Number(p.codigoPiezaRaw)
           }
          })
      };

    setLoading(true);

    try{
      const data = await apiCall(`${API_URL}/api/productos/new`, {method: 'POST', body: JSON.stringify(payload)});
      
      props.onSuccess(data);

      setNombre("");      
      setPiezas([{ id: genId(), codigoPieza: "", nombrePieza: "" }]);
      setPm(0);
      setRubro(0);

    }catch(err){
      console.error("Error creando producto:", err);
      setError(err.message || "Ocurrió un error al crear el producto.");
    }finally{
      setLoading(false);
    }
  };

  const handlePartChange = (part, id) => {
    setPiezas(prev => prev.map(p => (p.id === id ? { ...p, ...part, id } : p)));
  };

  const addPart = () => {
    setPiezas(prev => [...prev, { id: genId(), codigoPiezaRaw: "", codigoPieza: "", nombrePieza: "" }]);
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
            <Buscador
              opciones={props.registros}
              placeholder="Buscar registro de PM..."
              keys={['id_registro_pm','descripcion']}
              onChange={(id)=>setPm(id)}
              idField="id_registro_pm"
              displayField="descripcion"
              showId={true}
              maxResults={props.registros.length}
            />
            
            <label>Especificar rubro:</label>
            <Buscador 
              opciones={props.rubros} 
              placeholder="Buscar rubros..." 
              keys={['id_rubro', 'descripcion']} 
              onChange={(id)=>setRubro(id)} 
              idField="id_rubro" 
              displayField="descripcion"
              showId={true}
              maxResults={props.rubros.length}
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
            <button className="create" onClick={handleCreate} disabled={loading?true:false}>{loading?'Guardando...':'Crear'}</button>
          </div>
        </div>
      </div>
    </>
  );
}


