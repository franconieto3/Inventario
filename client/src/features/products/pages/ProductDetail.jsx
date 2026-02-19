import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { DropdownMenu } from '../../../components/ui/DropdownMenu';
import NavBar from '../../../components/layout/NavBar';

import { apiCall } from '../../../services/api';
import AgregarPlano from '../components/AgregarPlano';
import { UserAuth } from '../../auth/context/AuthContext';

import { PartDetail } from '../components/PartDetail';
import { AgregarPieza } from '../components/AgregarPieza';
import EdicionProducto from "../components/EdicionProducto";

import "./ProductDetail.css"
import Can from '../../../components/Can';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ProductDetail() {
  const { user, logout} = UserAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [menuProductoOpen, setMenuProductoOpen] = useState(false);
  const [mostrarEdicion, setMostrarEdicion] = useState(false);
  const [rubros, setRubros] = useState(null);
  const [registrosPM, setRegistrosPM] = useState(null);

  const fetchProduct = useCallback(async () => {
    try{
      const data = await apiCall(`${API_URL}/api/productos/${id}`, {});
      setProducto(data);
    }catch(err){
      console.error(err.message);
    }
  },[id]);

  const handleEliminarProducto = async ()=>{
      if(window.confirm("¿Seguro que deseas eliminar este producto?")){
          console.log("Eliminando producto")
          try{
              const res = await apiCall(`${API_URL}/api/productos/eliminacion/${producto.id_producto}`, {'method':"DELETE"});
              alert(`${producto.nombre} eliminado exitosamente`);
              navigate("/products");
              
          }catch(err){
              alert("No se pudo eliminar el producto seleccionado");
          }
      }
  }
  
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]); // El efecto se ejecuta si cambia el ID

  //Petción de rubros, listados de PM y productos al cargar el componente
  useEffect(() => {
      const fetchAuxData = async () => {
          setLoadingData(true);
          try {
              const [dataRubros, dataPM] = await Promise.all([
                  apiCall(`${API_URL}/api/productos/rubros`,{}),
                  apiCall(`${API_URL}/api/productos/registros-pm`,{})
              ])
              
              setRubros(dataRubros);
              setRegistrosPM(dataPM);

          } catch (error) {
              console.error("Error cargando listas:", error);
          } finally {
              setLoadingData(false);
          }
      };
      
      fetchAuxData();
  }, []);

 
  if (!producto) return <div>Cargando...</div>;

  return (
    <>
    <NavBar />
    <div className='body-container'>

      <div className='detail-container'>
        <div style={{'display':'flex', 'justifyContent':'space-between', 'alignItems':'center'}}>
          <h1>{producto.nombre}</h1>
          <Can permission="administrar_productos">
            <DropdownMenu
                isOpen={menuProductoOpen}
                onToggle={() => setMenuProductoOpen(!menuProductoOpen)}
                items={[
                    {
                        label: 'Editar producto',
                        icon: 'edit',
                        onClick: () => setMostrarEdicion(true)
                    },
                    {
                        label: 'Eliminar producto',
                        icon: 'delete',
                        color: 'red', 
                        onClick: () => handleEliminarProducto()
                    }                      
                ]}
            />
          </Can>
        </div>
        <p>Registro de producto médico: {producto.registro_pm.descripcion}</p>
        <p>Rubro: {producto.rubro.descripcion}</p>
        <Can permission="administrar_productos">
          <AgregarPieza producto={producto} onUploadSuccess={fetchProduct}/>
        </Can>
        <AgregarPlano producto={producto} onUploadSuccess={fetchProduct}/>

        {mostrarEdicion &&
          <EdicionProducto 
              producto={producto} 
              rubros={rubros} 
              registrosPM={registrosPM} 
              onUploadSuccess={()=>{
                  setMostrarEdicion(false); 
                  fetchProduct();
                  }} 
              onClose={()=>setMostrarEdicion(false)}
          />
        }

        <div style={{'marginTop':'20px'}}>
          {producto.pieza && producto.pieza.map(p => (
            <PartDetail 
              key={p.id_pieza}
              nombrePieza={p.nombre} 
              idPieza={p.id_pieza}
              codigoPieza={p.codigo}
              producto={producto}
              onRefreshParent={fetchProduct}
            />        
          ))}
        </div>
      </div>
    </div>
    </>
  );
}