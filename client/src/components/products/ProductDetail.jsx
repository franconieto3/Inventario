import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabase/client';

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

  //Estados de formulario
  const [denominacion, setDenominacion] = useState("");
  const [path, setPath] = useState("");
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

    // --- 1. Validaciones ---
    if (!file) {
      setError("Por favor, selecciona un archivo PDF.");
      return;
    }

    if (!denominacion.trim()) {
      setError("La denominación es obligatoria.");
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

  try {
        setLoading(true);

        // --- 2. Carga del archivo al Bucket (Supabase Storage) ---
        // Generamos un path único para evitar colisiones: /planos/ID_PRODUCTO/TIMESTAMP_NOMBRE
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${denominacion.replace(/\s+/g, '_')}.${fileExt}`;
        const filePath = `planos/${id}/${fileName}`;

        const { data: storageData, error: storageError } = await supabase
          .storage
          .from('documentos') // Asegúrate de que tu bucket se llame 'documentos' o 'planos'
          .upload(filePath, file);

        if (storageError) throw new Error(`Error al subir archivo: ${storageError.message}`);

        // Obtenemos la URL pública (o el path relativo según tu lógica de backend)
        // Si tu backend guarda solo el path relativo, usa 'filePath'.
        // Si guarda la URL completa:
        const { data: publicUrlData } = supabase.storage.from('documentos').getPublicUrl(filePath);
        const finalPath = publicUrlData.publicUrl; 

        // Actualizamos el estado local (opcional, por si lo usas en la UI luego)
        setPath(finalPath);

        // --- 3. Construcción del Payload ---
        // IMPORTANTE: Usamos 'finalPath' aquí, no la variable de estado 'path',
        // ya que el estado 'path' no se habrá actualizado todavía en este ciclo de ejecución.
        
        const payload = {
          documento: {
            descripcion: denominacion,
            tipo_documento: 1,
          },
          version: {
            n_version: Number(version),
            fecha_vigencia: fecha,
            commit: commit,
            path: finalPath,
            resolucion: resolucion
          },
          piezas: piezasPlano // Array de IDs de piezas seleccionadas
        };

        console.log("Enviando payload:", payload);

        // --- 4. Envío al Servidor ---
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/documentos', { // Ajusta el endpoint
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          // Si falla el backend, deberíamos considerar borrar el archivo de Supabase para no dejar basura
          // await supabase.storage.from('documentos').remove([filePath]);
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al guardar en base de datos");
        }

        const dataRespuesta = await response.json();
        
        alert("Plano cargado exitosamente");
        
        // Limpieza de formulario
        setDenominacion("");
        setVersion(0);
        setFecha("");
        setCommit("");
        setFile(null);
        setPiezasPlano([]);
        // Recargar producto para ver el nuevo plano en la lista
        // fetchProduct(); 

      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
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
                  <form>
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
                    </div>
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