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
  const [agregarPlanos, setAgregarPlanos] = useState(false);
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
  const [resetKey, setResetKey] = useState(0);

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
    try{
      const token = localStorage.getItem('token');
      
      // Llamamos al endpoint dinámico pasando el ID capturado
      const response = await fetch(`http://localhost:4000/productos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al cargar producto');
      }

      const data = await response.json();
      setProducto(data);
      
    }catch(err){
      console.error(err.message);
    }
  };

  useEffect(()=>{
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

  const limpiarNombreArchivo = (nombre) => {
    return nombre
      .normalize("NFD") // Descompone caracteres (á -> a + ´)
      .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
      .replace(/[^a-zA-Z0-9.\-]/g, "_"); // Reemplaza todo lo que no sea letra, número, punto o guion por "_"
  };


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

    if (version < 0 || !Number.isInteger(Number(version))) {
      setError("El número de versión debe ser un número entero igual o mayor a 0.");
      return;
    }

    if (!fecha) {
      setError("La fecha de vigencia es obligatoria.");
      return;
    }

    //Validar que no se haya ingresado una fecha futura (opcional)

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
      setLoading(true)

      const nombreLimpio = limpiarNombreArchivo(file.name);

      const response = await fetch('http://localhost:4000/subir-plano', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({fileName:nombreLimpio, userId: user.id})
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al generar URL de subida');
      }

      const {signedUrl, path, uploadToken } = await response.json();

      //Subir archivo al bucket con la url firmada
      const uploadResponse = await fetch(signedUrl,{
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      })

      if (!uploadResponse.ok){
        throw new Error('Error al subir el archivo físico al almacenamiento. Intente nuevamente.')
      }

      //Enviar los datos del formulario al backend

      const payload = {
        documento:{
          descripcion: file.name,
          id_tipo_documento: 1,
          id_producto: producto.id_producto
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
      
      alert("Plano subido y asociado correctamente.");
      
      //limpiarFormulario();
      setAgregarPlanos(false);
      

    }catch(err){
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado.");
    }finally{
      setLoading(false);
    }
  }

  const handleSelectAll = (e)=>{
    e.preventDefault();
    
    if (!producto?.pieza) return;

    // Si ya están todos seleccionados, vaciamos. Si falta alguno, seleccionamos todos.
    const todosSeleccionados = piezasPlano.length === producto.pieza.length;

    if (todosSeleccionados) {
      setPiezasPlano([]);
    } else {
      const todosLosIds = producto.pieza.map(p => p.id_pieza);
      setPiezasPlano(todosLosIds);
    }
  }

  const limpiarFormulario = () => {
    setFile(null);
    setVersion(0); // O el valor inicial que prefieras
    setFecha("");
    setResolucion("");
    setCommit("");
    setPiezasPlano([]);
    setResetKey(prev => prev + 1);
    setSeleccionarPiezas(false); 
  };

  useEffect(()=>{
    if(!agregarPlanos){
      limpiarFormulario();
    }
  },[agregarPlanos])

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
              <ul className='part-list' style={mostrarPiezas?{"display":"block"}:{"display":"none"}}>
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
              <div style={mostrarPlanos?{"display":"block"}:{"display":"none"}}>
                <div className='add-span' style={agregarPlanos?{"display":"none"}:{"display":"flex"}} onClick={()=>{setAgregarPlanos(true)}}>
                  <i className='material-icons' id="add-icon">add</i>
                  <h3 style={{"fontSize":"1rem"}}>Agregar plano</h3>
                </div>

                <div style={agregarPlanos?{"display":"flex","gap":"8px"}:{"display":"none"}}>
                  <i className='material-icons' id='close-button' onClick={()=>{setAgregarPlanos(false)}}>close</i>
                  <div className='upload-container' >
                    <div className='upload-header'>
                      <h3 style={{"fontSize":"1rem"}}>Agregar plano</h3>
                      <p className="card-description">
                        Sube el archivo, completa el formulario y asigna las piezas asociadas al plano 
                      </p>
                    </div>

                    <SubirArchivo key={resetKey} onUpload={(plano)=> plano.length > 0 ? setFile(plano[0]) : setFile(null)}/>
                    <div style={seleccionarPiezas?{"display":"block"}:{"display":"none"}}>
                      <div className='upload-content'>
                        <form>
                          <div className="form-input">
                            <label>Versión (*): </label>
                            <input type="number" value={version} onChange={(e)=>setVersion(e.target.value)}/>
                          </div>
                          <div className="form-input">
                            <label>Fecha de vigencia (*): </label>
                            <input type="date" value={fecha} onChange={(e)=>setFecha(e.target.value)}/>
                          </div>
                          <div className="form-input">
                            <label>Descripción de versión: </label>
                            <input type="text" value={commit} onChange={(e)=>setCommit(e.target.value)}/>
                          </div>
                          <div className="form-input">
                            <label>Resolución: </label>
                            <input type="text" value={resolucion} onChange={(e)=>setResolucion(e.target.value)}/>
                          </div>
                        </form>
                      </div>
                      <div style={{"marginTop":"10px"}}>Seleccione una pieza: </div>
                      {<ul className="part-list" style={{"marginBottom":"10px", "marginTop":"10px"}}>
                        {producto.pieza && producto.pieza.map(p => (
                          <li key={p.id_pieza} style={{
                                                      "marginBottom":"5px",
                                                      "fontSize": "0.875rem"}}>
                          <input type="checkbox" checked={piezasPlano.includes(p.id_pieza)} onChange={() => togglePieza(p.id_pieza)}/>
                          <span>{" "+producto.nombre + " " + p.nombre}</span>
                          </li>
                        ))}
                        <li>
                          <button onClick={handleSelectAll}>
                            {piezasPlano.length === producto.pieza.length? "Deseleccionar todo":"Seleccionar todo"}
                          </button>
                        </li>
                      </ul>}
                      <button onClick={subirPlano} disabled={loading?true:false}>Guardar</button>

                      {error && <p style={{"color":"red"}}>{error}</p>}
                    </div>
                  </div>
                </div>
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