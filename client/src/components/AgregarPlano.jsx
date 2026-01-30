import { useState, useEffect } from "react";
import { apiCall } from "../services/api";

import "../styles/ProductDetail.css"

import SubirArchivo from "./SubirArchivo";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AgregarPlano({producto, onUploadSuccess}){

    //Estados de formulario
    const [fecha, setFecha] = useState("");
    const [commit, setCommit] = useState("");
    const [resetKey, setResetKey] = useState(0);
    const [piezasPlano, setPiezasPlano] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);

    const [file, setFile] = useState(null);
    
    //Estado de visualización
    const [seleccionarPiezas,setSeleccionarPiezas] = useState(false);
    const [agregarPlanos, setAgregarPlanos] = useState(false);

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

    
    useEffect(()=>{
        const fetchTipos = async ()=>{
            const data = await apiCall(`${API_URL}/api/documentos/tipo-documento`,{method:'GET'});
            setTiposDocumento(data);    
        }
        fetchTipos();
    },[])

    useEffect(()=>{console.log(tiposDocumento)},[tiposDocumento]);
    

    useEffect(()=>{
        if(file){
        setSeleccionarPiezas(true);
        return;
        }
        setSeleccionarPiezas(false);
        return;

    },[file])

    const subirPlano = async(e)=>{
        e.preventDefault();
        
        // --- 1. Validaciones ---
        if (!file) {
            setError("Por favor, selecciona un archivo PDF.");
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
        const nombreLimpio = limpiarNombreArchivo(file.name);

        try{
            setLoading(true)
            
            //1. Solicitar la url firmada para la carga de archivos al servidor 
            const { signedUrl, path, uploadToken } = await apiCall(
                `${API_URL}/api/documentos/subir-plano`,
                 {method: 'POST', 
                  body: JSON.stringify({fileName:nombreLimpio, 
                  fileType: file.type, 
                  fileSize: file.size,
                  idTipoDocumento: 1})
                })
            
            //2. Subir archivo al bucket con la url firmada
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
            
            const payload = {
            
            documento:{
                id_producto: producto.id_producto
            },
            version:{
                fecha_vigencia: fecha,
                commit: commit,
                path: path,
                id_tipo_documento: 1
            },
            piezas:piezasPlano
            };
            console.log(payload);
            
            //3. Enviar los datos del plano al backend
            const respuesta = await apiCall(`${API_URL}/api/documentos/guardar-documento`, {method: 'POST', body: JSON.stringify(payload)});
            
            alert("Plano subido y asociado correctamente.");
            setAgregarPlanos(false);

            if (onUploadSuccess) {
                onUploadSuccess();
            }

        }catch(err){
            console.error(err);
            setError(err.message || "Ocurrió un error inesperado.");
        }finally{
            setLoading(false);
        }
    }

    const limpiarNombreArchivo = (nombre) => {
        return nombre
        .normalize("NFD") // Descompone caracteres (á -> a + ´)
        .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
        .replace(/[^a-zA-Z0-9.\-]/g, "_"); // Reemplaza todo lo que no sea letra, número, punto o guion por "_"
    };
    
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
        setFecha("");
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

    return(
    <>
        <div className='add-span' style={agregarPlanos?{"display":"none"}:{"display":"flex"}} onClick={()=>{setAgregarPlanos(true)}}>
            <i className='material-icons' id="add-icon">add</i>
            <h3 style={{"fontSize":"1rem"}}>Agregar plano</h3>
        </div>
        {agregarPlanos && <div className="overlay">
            <div className="modal">
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
                                        <label>Fecha de vigencia (*): </label>
                                        <input type="date" value={fecha} onChange={(e)=>setFecha(e.target.value)}/>
                                    </div>
                                    <div className="form-input">
                                        <label>Descripción de versión: </label>
                                        <input type="text" value={commit} onChange={(e)=>setCommit(e.target.value)}/>
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
        </div>}
    </>);
}