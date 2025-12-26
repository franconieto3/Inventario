import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import "../styles/Buscador.css"

const Buscador = ({ opciones, placeholder, keys, onChange, idField, displayField }) => {

  const [busqueda, setBusqueda] = useState("");
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(()=>{
    onChange(value)
  },[value])

  // 1. Configuramos Fuse (useMemo para no instanciarlo en cada render)
  const fuse = useMemo(() => {
    return new Fuse(opciones, {
      keys: keys,
      threshold: 0.3, // 0.0 = coincidencia exacta, 1.0 = coincide con todo
    });
  }, [opciones]);

  // 2. Calculamos los resultados
  const resultados = useMemo(() => {
    if (!busqueda) return opciones; // Si no hay texto, mostramos todo

    // AQUI ESTA LA CLAVE:
    // fuse.search devuelve [{item: ...}, {item: ...}]
    // Usamos .map para extraer el 'item' y dejar el array plano como el original
    return fuse.search(busqueda).map(resultado => resultado.item);
    
  }, [busqueda, fuse, opciones]);

  const handleClick = (item)=>{
    setValue(item[idField]);
    setBusqueda(item[displayField]);
    setFocus(false);
  }

  return (
    <div style={{"marginBottom": "15px"}}>
      <input 
        type="text" 
        placeholder={placeholder}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        onFocus={()=>setFocus(true)}
        onBlur={()=>setFocus(false)}
        style={{"marginTop": "5px", "marginBottom":"0px"}}
      />
      <div className='option-container' style={focus?{'display':'block'}:{'display':'none'}}>
        <ul>
            {resultados.map(opcion => (
            // Como aplanamos el array arriba, accedemos directo a las propiedades
            <li
              className="search-option"
              key={opcion[idField]} onMouseDown={()=>handleClick(opcion)} style={{"padding":"4px","display":"flex"}}>
              <span style={{"marginLeft":"10px"}}>{opcion[idField]} - {opcion[displayField]}</span>
            </li>
            ))}

            {resultados.length === 0 && (
            <li>No se encontraron resultados.</li>
            )}
        </ul>
      </div>
    </div>
  );
};

export default Buscador;