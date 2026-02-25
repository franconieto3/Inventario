import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import "./Buscador.css"

const Buscador = ({ 
  opciones, 
  placeholder, 
  keys, 
  onChange, 
  idField, 
  displayField, 
  showId, 
  valorInicial,
  threshold = 0.6,
  debounceMs = 300,
  maxResults = 50  
}) => {

  const [busqueda, setBusqueda] = useState("");
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState(0);

  const [busquedaDebounced, setBusquedaDebounced] = useState("");


  useEffect(() => {
    // Verificamos que exista un valorInicial y que tengamos opciones donde buscar
    if (valorInicial !== undefined && valorInicial !== null && opciones?.length > 0) {
      
      const encontrado = opciones.find(op => op[idField] === valorInicial);
      
      if (encontrado) {
        setValue(encontrado[idField]);
        setBusqueda(encontrado[displayField]);
        setBusquedaDebounced(encontrado[displayField]);
      }
    }
  }, [valorInicial, opciones, idField, displayField]);

  //Logica de debounce
  useEffect(() => {
    const timerId = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, debounceMs);

    return () => clearTimeout(timerId);
  }, [busqueda, debounceMs]);

  // 1. Configuramos Fuse (useMemo para no instanciarlo en cada render)
  const fuse = useMemo(() => {
    return new Fuse(opciones, {
      keys: keys,
      threshold: threshold, // 0.0 = coincidencia exacta, 1.0 = coincide con todo
    });
  }, [opciones, keys, threshold]);

  // 2. Calculamos los resultados
  const resultados = useMemo(() => {
    /*
    if (!busqueda) return opciones; // Si no hay texto, mostramos todo
    return fuse.search(busqueda).map(resultado => resultado.item);
    */
    if (!busquedaDebounced) {
      return opciones.slice(0, maxResults); 
    }
    const resultadosBusqueda = fuse.search(busquedaDebounced);

    return resultadosBusqueda
      .slice(0, maxResults) // 1ro: Cortamos el array (ej. de 1000 a 50)
      .map(resultado => resultado.item);

  }, [busquedaDebounced, fuse, opciones, maxResults]);

  const handleClick = (item)=>{
    onChange(item[idField]);
    setValue(item[idField]);
    setBusqueda(item[displayField]);
    setFocus(false);
  }

  return (
    <div className='buscador-wrapper' >
      <input 
        type="text" 
        className="buscador-input"
        placeholder={placeholder}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        onFocus={()=>setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 200)}
        style={{"marginTop": "5px", "marginBottom":"0px","width":"100%"}}
      />
      {focus && (
        <div className='buscador-popover'>
          <ul className="buscador-list">
              {resultados.map(opcion => (
              // Como aplanamos el array arriba, accedemos directo a las propiedades
              <li
                className="buscador-item"
                key={opcion[idField]} 
                onMouseDown={()=>handleClick(opcion)} 
              >
                <span className="buscador-item-text">
                  {showId? opcion[idField]+ " - ":null}{opcion[displayField]}
                </span>
              </li>
              ))}

              {resultados.length === 0 && (
                <li className="buscador-empty">
                  No se encontraron resultados.
                </li>
              )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Buscador;