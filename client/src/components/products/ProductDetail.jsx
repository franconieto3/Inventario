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
import { AgregarPieza } from './AgregarPieza';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ProductDetail() {
  const { user, logout} = UserAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [producto, setProducto] = useState(null);

  const fetchProduct = async () => {
    try{

      const data = await apiCall(`${API_URL}/api/productos/${id}`, {});
      setProducto(data);
      
    }catch(err){
      console.error(err.message);
    }
  };


  useEffect(() => {
    fetchProduct();
  }, [id]); // El efecto se ejecuta si cambia el ID
 
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
        <div className='add-span'>
            <i className='material-icons' id="add-icon">add</i>
            <h3 style={{"fontSize":"1rem"}}>Agregar pieza</h3>
        </div>
*/}
        <AgregarPieza producto={producto} onUploadSuccess={fetchProduct}/>
        <AgregarPlano producto={producto} onUploadSuccess={fetchProduct}/>

        <div style={{'marginTop':'20px'}}>
          {producto.pieza && producto.pieza.map(p => (
            <PartDetail key={p.id_pieza} nombreProducto={producto.nombre} nombrePieza={p.nombre} idPieza={p.id_pieza} codigoPieza={p.codigo_am} />        
          ))}
        </div>
      </div>
    </div>
    </>
  );
}