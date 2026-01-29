import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
//import { supabase } from '../../supabase/client';

import NavBar from '../NavBar';

import "../../styles/ProductDetail.css"
import SubirArchivo from '../SubirArchivo';
import { UserAuth } from '../../context/AuthContext';
import { apiCall } from '../../services/api';
import AgregarPlano from '../AgregarPlano';
import { PartDetail } from './PartDetail';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ProductDetail() {
  const { user, logout} = UserAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [producto, setProducto] = useState(null);

  //Estados de visualización 
  const [mostrarPiezas, setMostrarPiezas] = useState(true);
  const [mostrarPlanos, setMostrarPlanos] = useState(true);
  const [mostrarMateriales, setMostrarMateriales] = useState(true);
  const [mostrarProcesos, setMostrarProcesos] = useState(true);
  const [mostrarElementos, setMostrarElementos] = useState(true);
  const [mostrarComponentes, setMostrarComponentes] = useState(true);

  const fetchProduct = async () => {
    try{

      const data = await apiCall(`${API_URL}/api/productos/${id}`, {});
      setProducto(data);
      
    }catch(err){
      console.error(err.message);
    }
  };

  //useEffect(()=>{console.log(producto)},[producto])

  useEffect(() => {
    fetchProduct();
  }, [id]); // El efecto se ejecuta si cambia el ID
  /*
    // Función para pedir la URL firmada y abrirla
    const handleVerPlano = async (pathArchivo) => {
      try {
        const {signedUrl} = await apiCall(`${API_URL}/api/documentos/obtener-url-plano`, {method:'POST', body:JSON.stringify({ path: pathArchivo })});
        window.open(signedUrl, '_blank');

      } catch (err) {
        alert(err.message); // O usa un estado setError para mostrarlo bonito
      }
    };
  */
  if (!producto) return <div>Cargando...</div>;

  return (
    <>
    <NavBar />
    <div className='body-container'>
      <div className='detail-container'>
        <h1>{producto.nombre}</h1>
        <p>Registro de producto médico: {producto.registro_pm.descripcion}</p>
        <p>Rubro: {producto.rubro.descripcion}</p>
        {/* 
        <div>
          <div className='detail'>
            <div>
              <div className='detail-subtitle'>
                <input type='checkbox' name="Piezas" onChange={()=>setMostrarPiezas(!mostrarPiezas)} checked={mostrarPiezas}/>
                <span>Piezas:</span>
              </div>
              <ul className='part-list' style={mostrarPiezas?{"display":"block"}:{"display":"none"}}>
                {producto.pieza && producto.pieza.map(p => (
                  <li key={p.id_pieza}>
                  Código: {p.codigo_am} - {producto.nombre + " " + p.nombre}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          */}
          {/*
          <div className='detail'>
            <div>
              <div className='detail-subtitle'>
                <input type='checkbox' name="Planos" onChange={()=>setMostrarPlanos(!mostrarPlanos)} checked={mostrarPlanos}/>
                <span>Planos:</span>
              </div>

              <div style={mostrarPlanos?{"display":"block"}:{"display":"none"}}>

                <ul className='planos-list'>
                  {producto.planos && producto.planos.map(plano => (
                    <li key={plano.id_version}>
                      <span 
                        onClick={() => handleVerPlano(plano.path)} 
                        style={{
                          cursor: 'pointer', 
                          color: 'blue', 
                          textDecoration: 'underline'
                        }}
                      >
                        {plano.descripcion}
                      </span>
                    </li>
                  ))}
                </ul>

                <AgregarPlano producto={producto} onUploadSuccess={fetchProduct}/>
              </div>
            </div>
          </div>
          */}
          {/*
          <div className='detail'>
            <div>
              <div className='detail-subtitle'>
                <input type='checkbox' name="Componentes" onChange={()=>setMostrarComponentes(!mostrarComponentes)} checked={mostrarComponentes}/>
                <span>Componentes:</span>
              </div>
              <div className='add-span' style={!mostrarComponentes?{"display":"none"}:{"display":"flex"}} >
                <i className='material-icons' id="add-icon">add</i>
                <h3 style={{"fontSize":"1rem"}}>Agregar componentes</h3>
              </div>
            </div>
          </div>

          <div className='detail'>
            <div>
              <div className='detail-subtitle'>
                <input type='checkbox' name="Materiales" onChange={()=>setMostrarMateriales(!mostrarMateriales)} checked={mostrarMateriales}/>
                <span>Materiales:</span>
              </div>
              <div className='add-span' style={!mostrarMateriales?{"display":"none"}:{"display":"flex"}} >
                <i className='material-icons' id="add-icon">add</i>
                <h3 style={{"fontSize":"1rem"}}>Agregar materiales</h3>
              </div>
            </div>
          </div>

          <div className='detail'>
            <div>
              <div className='detail-subtitle'>
                <input type='checkbox' name="Elementos" onChange={()=>setMostrarElementos(!mostrarElementos)} checked={mostrarElementos}/>
                <span>Elementos de control:</span>
              </div>
              <div className='add-span' style={!mostrarElementos?{"display":"none"}:{"display":"flex"}} >
                <i className='material-icons' id="add-icon">add</i>
                <h3 style={{"fontSize":"1rem"}}>Agregar elementos de control</h3>
              </div>
            </div>
          </div>

          <div className='detail'>
            <div>
              <div className='detail-subtitle'>
                <input type='checkbox' name="Procesos" onChange={()=>setMostrarProcesos(!mostrarProcesos)} checked={mostrarProcesos}/>
                <span>Procesos:</span>
              </div>
              <div className='add-span' style={!mostrarProcesos?{"display":"none"}:{"display":"flex"}} >
                <i className='material-icons' id="add-icon">add</i>
                <h3 style={{"fontSize":"1rem"}}>Agregar procesos</h3>
              </div>
            </div>
          </div>  
        </div>
        */}
        
          {producto.pieza && producto.pieza.map(p => (
            <PartDetail key={p.id_pieza} nombreProducto={producto.nombre} nombrePieza={p.nombre} idPieza={p.id_pieza} codigoPieza={p.codigo_am} />        
          ))}
          <AgregarPlano producto={producto} onUploadSuccess={fetchProduct}/>
      </div>
    </div>
    </>
  );
}