import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
//import { supabase } from '../../supabase/client';

import NavBar from '../NavBar';

import "../../styles/ProductDetail.css"
import SubirArchivo from '../SubirArchivo';
import { UserAuth } from '../../context/authContext';

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
  const [seleccionarPiezas,setSeleccionarPiezas] = useState(false);
  

  //Estado de archivo para plano
  const [file, setFile] = useState(null);

  //Estados de formulario
  //const [denominacion, setDenominacion] = useState("");
  const [version, setVersion] = useState(0);
  const [fecha, setFecha] = useState("");
  const [resolucion, setResolucion] = useState("");
  const [commit, setCommit] = useState("");

  const [piezasPlano, setPiezasPlano] = useState([]);

  //Estado de carga
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePieza = (id) => {
    setPiezasPlano(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      }
      return [...prev, id];
    });
  };

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

  useEffect(()=>{
    console.log(file);
    if(file){
      setSeleccionarPiezas(true);
      return;
    }
    setSeleccionarPiezas(false);
    return;

  },[file])

  useEffect(() => {
    fetchProduct();
  }, [id]); // El efecto se ejecuta si cambia el ID

  const subirPlano = async(e)=>{
    e.preventDefault();
    const token = localStorage.getItem('token'); 

    if (!token) {
            logout(); // Asegurar limpieza
            navigate('/login');
            return;
    }
    
    // --- 1. Validaciones ---
    if (!file) {
      setError("Por favor, selecciona un archivo PDF.");
      return;
    }
    /*
    if (!denominacion.trim()) {
      setError("La denominación es obligatoria.");
      return;
    }
    */
    if (version < 0 || !Number.isInteger(Number(version))) {
      setError("El número de versión debe ser un número entero igual o mayor a 0.");
      return;
    }

    if (!fecha) {
      setError("La fecha de vigencia es obligatoria.");
      return;
    }

    //Validar que no se haya ingresado una fecha futura

    // Validación simple de formato de fecha (el input type="date" suele garantizar YYYY-MM-DD)
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha)) {
      setError("Formato de fecha inválido.");
      return;
    }

    if(piezasPlano.length===0){
      setError("Debe seleccionar al menos una pieza");
      return;
    }

    
    try{
      const response = await fetch('http://localhost:4000/subir-plano', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({fileName:file.name, userId: user.id})
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al generar URL de subida');
      }

      const {signedUrl, path, uploadToken } = await response.json();

      //Subir archivo al bucket con la url firmada
      //Enviar los datos del formulario al backend

      const payload = {
        documento:{
          descripcion: file.name,
          id_tipo_documento: 1
        },
        version:{
          n_version: Number(version),
          fecha_vigencia: fecha,
          commit: commit,
          resolucion:resolucion,
          path: path
        },
        piezas:piezasPlano
      };

      const res = await fetch('http://localhost:4000/guardar-documento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al generar URL de subida');
      }

      const respuesta = await res.json();
      console.log(respuesta);

    }catch(err){
      console.error(err);
    }
  }

  

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
                  <form>{/*
                    <div>
                      <label>Denominación: </label>
                      <input
                        type="text"
                        id="denominacion"
                        name="denominacion"
                        placeholder="Denominacion"
                        value={denominacion}
                        onChange={(e)=>setDenominacion(e.target.value)}
                      />
                    </div>*/}
                    <div>
                      <label>Versión (*): </label>
                      <input type="number" value={version} onChange={(e)=>setVersion(e.target.value)}/>
                    </div>
                    <div>
                      <label>Fecha de vigencia (*): </label>
                      <input type="date" value={fecha} onChange={(e)=>setFecha(e.target.value)}/>
                    </div>
                    <div>
                      <label>Descripción de versión: </label>
                      <input type="text" value={commit} onChange={(e)=>setCommit(e.target.value)}/>
                    </div>
                    <div>
                      <label>Resolución: </label>
                      <input type="text" value={resolucion} onChange={(e)=>setResolucion(e.target.value)}/>
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
                <button onClick={subirPlano} disabled={loading?true:false}>Guardar</button>

                {error && <p style={{"color":"red"}}>{error}</p>}
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