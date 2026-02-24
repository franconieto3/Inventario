import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import "./Buscador.css"

const Buscador = ({ opciones, placeholder, keys, onChange, idField, displayField, showId, valorInicial }) => {

  const [busqueda, setBusqueda] = useState("");
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState(0);


  useEffect(() => {
    // Verificamos que exista un valorInicial y que tengamos opciones donde buscar
    if (valorInicial !== undefined && valorInicial !== null && opciones?.length > 0) {
      
      const encontrado = opciones.find(op => op[idField] === valorInicial);
      
      if (encontrado) {
        setValue(encontrado[idField]);
        setBusqueda(encontrado[displayField]);
      }
    }
  }, [valorInicial, opciones, idField, displayField]);

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
    onChange(item[idField]);
    setValue(item[idField]);
    setBusqueda(item[displayField]);
    setFocus(false);
  }

  return (
    <div style={{"marginBottom": "15px", "position": "relative", "width":"100%"}}>
      <input 
        type="text" 
        placeholder={placeholder}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        onFocus={()=>setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 200)}
        style={{"marginTop": "5px", "marginBottom":"0px","width":"100%"}}
      />
      <div className='option-container' style={focus?{'display':'block'}:{'display':'none'}}>
        <ul>
            {resultados.map(opcion => (
            // Como aplanamos el array arriba, accedemos directo a las propiedades
            <li
              className="search-option"
              key={opcion[idField]} onMouseDown={()=>handleClick(opcion)} style={{"padding":"4px","display":"flex"}}>
              <span>
                {showId? opcion[idField]+ " - ":null}{opcion[displayField]}
              </span>
            </li>
            ))}

            {resultados.length === 0 && (
            <li style={{"marginTop": "8px", "marginBottom": "8px"}}>No se encontraron resultados.</li>
            )}
        </ul>
      </div>
    </div>
  );
};

export default Buscador;