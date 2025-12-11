import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import NavBar from '../NavBar';

import "../../styles/ProductDetail.css"
import SubirArchivo from '../SubirArchivo';

export default function ProductDetail() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  //Estados de visualización 
  const [mostrarPiezas, setMostrarPiezas] = useState(true);
  const [mostrarPlanos, setMostrarPlanos] = useState(true);
  const [mostrarMateriales, setMostrarMateriales] = useState(true);
  const [mostrarProcesos, setMostrarProcesos] = useState(true);
  const [seleccionarPiezas,setSeleccionarPiezas] = useState(false);
  

  //Estado de archivo para plano
  const [file, setFile] = useState(null);
  const [piezasPlano, setPiezasPlano] = useState([]);

  const togglePieza = (id) => {
    setPiezasPlano(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      }
      return [...prev, id];
    });
  };

  const subirPlano = ()=>{

  }

  useEffect(()=>{
    if(file){
      setSeleccionarPiezas(true);
      return;
    }
    setSeleccionarPiezas(false);
    return;

  },[file])

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem('token');
      
      // Llamamos al endpoint dinámico pasando el ID capturado
      const response = await fetch(`http://localhost:4000/productos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducto(data);
      }
    };

    fetchProduct();
  }, [id]); // El efecto se ejecuta si cambia el ID

  if (!producto) return <div>Cargando...</div>;

  return (
    <>
    <NavBar />
    <div className='body-container'>
      <div className='detail-container'>
        <h1>{producto.nombre}</h1>
        <p>Registro PM: {producto.id_registro_pm}</p>
        <p>Rubro: {producto.id_rubro}</p>
        <div>
          <div className='detail'>
            <div>
              <div className='detail-subtitle'>
                <input type='checkbox' name="Piezas" onChange={()=>setMostrarPiezas(!mostrarPiezas)} checked={mostrarPiezas}/>
                <span>Piezas:</span>
              </div>
              <ul style={mostrarPiezas?{"display":"block"}:{"display":"none"}}>
                {producto.pieza && producto.pieza.map(p => (
                  <li key={p.id_pieza}>
                  Código: {p.codigo_am} - {producto.nombre + " " + p.nombre}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='detail'>
            <div>
              <div className='detail-subtitle'>
                <input type='checkbox' name="Planos" onChange={()=>setMostrarPlanos(!mostrarPlanos)} checked={mostrarPlanos}/>
                <span>Planos:</span>
              </div>
              
              <div className='upload-container' style={mostrarPlanos?{"display":"block"}:{"display":"none"}}>
                <div className='upload-header'>
                  <h3>Agregar plano</h3>
                  <p className="card-description">
                    Sube el archivo .pdf y asigna las piezas asociadas al plano 
                  </p>
                </div>

                {/* Card Content */}

                <div className='upload-content'>
                  <form>
                    <div>
                      <label>Denominación: </label>
                      <input
                        type="text"
                        id="denominacion"
                        name="denominacion"
                        placeholder="Denominacion"
                        className="input-denominacion"
                      />
                    </div>
                    <div>
                      <label>Versión: </label>
                      <input type="number"/>
                    </div>
                    <div>
                      <label>Fecha de vigencia: </label>
                      <input type="date"/>
                    </div>
                    <div>
                      <label>Descripción de versión: </label>
                      <input type="text"/>
                    </div>
                    <div>
                      <label>Resolución: </label>
                      <input type="text"/>
                    </div>
                  </form>
                </div>

                <SubirArchivo onUpload={(plano)=> plano.length > 0 ? setFile(plano[0]) : setFile(null)}/>
                
                {/*Botón de seleccionar todos*/}
                
                {<ul style={seleccionarPiezas?{"display":"block"}:{"display":"none"}}>
                  {producto.pieza && producto.pieza.map(p => (
                    <li key={p.id_pieza}>
                    <input type="checkbox" checked={piezasPlano.includes(p.id_pieza)} onChange={() => togglePieza(p.id_pieza)}/>
                    <span>{producto.nombre + " " + p.nombre}</span>
                    </li>
                  ))}
                </ul>}
                <button onClick={subirPlano}>Guardar</button>
              </div>
              
            </div>
          </div>

          <div className='detail'>
            <div>
              <div className='detail-subtitle'>
                <input type='checkbox' name="Materiales" onChange={()=>setMostrarMateriales(!mostrarMateriales)} checked={mostrarMateriales}/>
                <span>Materiales:</span>
              </div>
              <p>+ Agregar materiales</p>
            </div>
          </div>

          <div className='detail'>
            <div>
              <div className='detail-subtitle'>
                <input type='checkbox' name="Procesos" onChange={()=>setMostrarProcesos(!mostrarProcesos)} checked={mostrarProcesos}/>
                <span>Procesos:</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}