import { useState, useEffect } from "react";

import SubirArchivo from "../../../components/ui/SubirArchivo";
import { apiCall } from "../../../services/api";
import Button from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

//import "../styles/ProductDetail.css"
import "./AgregarDocumento.css"
import { useDocuments } from "../hooks/useDocuments";
import { limpiarNombreArchivo } from "../../../services/formatearNombreArchivo";
import { ToggleSelector } from "../../../components/ui/ToggleSelector";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AgregarPlano({producto, onUploadSuccess}){

    //Estados de formulario
    const [fecha, setFecha] = useState("");
    const [commit, setCommit] = useState("");
    const [resetKey, setResetKey] = useState(0);
    const [piezasPlano, setPiezasPlano] = useState([]);

    const [idTipoDocumento, setIdTipoDocumento] = useState("");
    const {tiposDocumento} = useDocuments();
    const [file, setFile] = useState(null);
    
    //Estado de visualización
    const [seleccionarPiezas,setSeleccionarPiezas] = useState(false);
    const [agregarPlanos, setAgregarPlanos] = useState(false);
    const [mostrarFecha, setMostrarFecha] = useState(null);

    //Estado de carga
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const tipoDocumentoSeleccionado = tiposDocumento.find(
        t => String(t.id_tipo_documento) === String(idTipoDocumento)
    );
    
    const formatosPermitidos = tipoDocumentoSeleccionado?.tipos_permitidos || []; 
    
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

        if (mostrarFecha === true) {
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaRegex.test(fecha)) {
                setError("Formato de fecha inválido.");
                return;
            }
        }

        if(piezasPlano.length===0){
            setError("Debe seleccionar al menos una pieza");
            return;
        }
        //const nombreLimpio = limpiarNombreArchivo(file.name);
        
        console.log("MIME type: ", file.type)

        try{
            setLoading(true)
            
            //1. Solicitar la url firmada para la carga de archivos al servidor 
            const { signedUrl, path, uploadToken } = await apiCall(
                `${API_URL}/api/documentos/subir-plano`,
                 {method: 'POST', 
                  body: JSON.stringify({fileName:limpiarNombreArchivo(file.name), 
                  fileType: file.type, 
                  fileSize: file.size,
                  idTipoDocumento: idTipoDocumento
                })
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
                id_tipo_documento: idTipoDocumento
            },
            piezas:piezasPlano
            };
            
            
            //3. Enviar los datos del plano al backend
            const respuesta = await apiCall(`${API_URL}/api/documentos/guardar-documento`, {method: 'POST', body: JSON.stringify(payload)});
            
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

    const limpiarFormulario = () => {
        setFile(null);
        setFecha("");
        setCommit("");
        setPiezasPlano([]);
        setResetKey(prev => prev + 1);
        setSeleccionarPiezas(false); 
        
        setMostrarFecha(null);
    };
    
    useEffect(()=>{
        if(!agregarPlanos){
        limpiarFormulario();
        setIdTipoDocumento("");
        }
    },[agregarPlanos])

    return(
    <>
        <button className='add-span' onClick={()=>{setAgregarPlanos(true)}}>
            <i className='material-icons' id="add-icon">add</i>
            Agregar documento
        </button>
        {agregarPlanos && 
        <Modal
            titulo="Agregar nuevo documento"
            descripcion="Sube el archivo, completa el formulario y asigna las piezas asociadas al documento"
            onClose={()=>setAgregarPlanos(false)}
        >
                    <div className='upload-container' >

                        <select value={idTipoDocumento} onChange={(e) => setIdTipoDocumento(e.target.value)}>
                            <option value="" disabled>
                                Seleccione el tipo de documento a subir
                            </option>
                            {tiposDocumento.map((td)=><option key={td.id_tipo_documento} value={td.id_tipo_documento}>{td.descripcion}</option>)}
                        </select>

                        {idTipoDocumento && 
                            <SubirArchivo 
                                key={resetKey} 
                                acceptedFileTypes={formatosPermitidos} 
                                onUpload={(plano)=> plano.length > 0 ? setFile(plano[0]) : setFile(null)} 
                                onRemove={limpiarFormulario}
                        />}

                        {seleccionarPiezas && <div className="inputs-documentos">
                            <div className='upload-content'>
                                <form>
                                    <div style={{"marginBottom":"10px"}}>
                                        <label>¿Es una nueva versión?</label>
                                        <div style={{"marginBottom": "5px"}}>
                                            <input 
                                                type="radio" 
                                                name="mostrarFecha" 
                                                checked={mostrarFecha===false} 
                                                onChange={()=>{
                                                    setMostrarFecha(false);
                                                    setFecha(new Date().toISOString());
                                                }}/>
                                            <span> Sí </span>
                                        </div>
                                        <div style={{"marginBottom": "5px"}}>
                                            <input 
                                                type="radio" 
                                                name="mostrarFecha" 
                                                checked={mostrarFecha===true} 
                                                onChange={()=>{
                                                    setMostrarFecha(true);
                                                    setFecha("");
                                                }}/>
                                            <span> No </span>
                                        </div>
                                    </div>

                                    {mostrarFecha && 
                                    <div className="form-input">
                                        <label>Fecha de vigencia * </label>
                                        <input 
                                            type="date" 
                                            value={fecha} 
                                            onChange={(e)=>setFecha(e.target.value)}
                                            style={{padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                                        />
                                    </div>}
                                    <div className="form-input">
                                        <label>Descripción de versión * </label>
                                        <input 
                                            type="text" 
                                            value={commit} 
                                            onChange={(e)=>setCommit(e.target.value)}
                                            style={{padding:'10px', border:'1px solid #ccc', borderRadius:'4px', width:'100%', marginTop:'5px'}}
                                        />
                                    </div>
                                </form>
                            </div>
                            <ToggleSelector
                                titulo = "Asociar piezas"
                                items={producto?.pieza || []}
                                idField={'id_pieza'}
                                displayField={(item)=>`${producto?.nombre || ''} ${item.nombre}`}
                                selectedItems={piezasPlano}
                                onChangeSelection={setPiezasPlano}
                            />
                            <Button variant='default' onClick={subirPlano} disabled={loading?true:false} style={{width:'100%'}}>Guardar</Button>

                            {error && <p style={{"color":"red"}}>{error}</p>}
                        </div>}
                    </div>
        </Modal>
        }
    </>);
}