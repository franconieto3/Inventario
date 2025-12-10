import { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import "../styles/BuscadorRubros.css"

const BuscadorRubros = ({ rubros, onChange }) => {

  const [busqueda, setBusqueda] = useState("");
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(()=>{
    onChange(value)
  },[value])

  // 1. Configuramos Fuse (useMemo para no instanciarlo en cada render)
  const fuse = useMemo(() => {
    return new Fuse(rubros, {
      keys: ['id_rubro', 'descripcion'],
      threshold: 0.3, // 0.0 = coincidencia exacta, 1.0 = coincide con todo
    });
  }, [rubros]);

  // 2. Calculamos los resultados
  const resultados = useMemo(() => {
    if (!busqueda) return rubros; // Si no hay texto, mostramos todo

    // AQUI ESTA LA CLAVE:
    // fuse.search devuelve [{item: ...}, {item: ...}]
    // Usamos .map para extraer el 'item' y dejar el array plano como el original
    return fuse.search(busqueda).map(resultado => resultado.item);
    
  }, [busqueda, fuse, rubros]);

  const handleClick = (rubro)=>{
    setValue(rubro.id_rubro);
    setBusqueda(rubro.descripcion);
    setFocus(false);
  }

  return (
    <div>
      <input 
        type="text" 
        placeholder="Buscar rubro..." 
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        onFocus={()=>setFocus(true)}
        onBlur={()=>setFocus(false)}
      />
      <div className='option-container' style={focus?{'display':'block'}:{'display':'none'}}>
        <ul>
            {resultados.map(rubro => (
            // Como aplanamos el array arriba, accedemos directo a las propiedades
            <li key={rubro.id_rubro} onMouseDown={()=>handleClick(rubro)}>
                <span>{rubro.id_rubro}</span> 
                {' '}- {rubro.descripcion}
            </li>
            ))}

            {resultados.length === 0 && (
            <li>No se encontraron rubros.</li>
            )}
        </ul>
      </div>
    </div>
  );
};

export default BuscadorRubros;