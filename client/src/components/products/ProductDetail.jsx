import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import NavBar from '../NavBar';

import "../../styles/ProductDetail.css"
import SubirArchivo from '../SubirArchivo';

export default function ProductDetail() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [mostrarPiezas, setMostrarPiezas] = useState(true);
  const [mostrarPlanos, setMostrarPlanos] = useState(true);
  const [mostrarMateriales, setMostrarMateriales] = useState(true);
  const [mostrarProcesos, setMostrarProcesos] = useState(true);

  const [file, setFile] = useState(null);
  useEffect(()=>console.log(file),[file])



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
                      <label>Denominación</label>
                      <input
                        type="text"
                        id="denominacion"
                        name="denominacion"
                        placeholder="Denominacion"
                        className="input-denominacion"
                      />
                    </div>
                    <div>
                      <label>Versión</label>
                      <input type="number"/>
                    </div>
                  </form>
                </div>
                <SubirArchivo onUpload={(plano)=>{setFile(plano)}}/>

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