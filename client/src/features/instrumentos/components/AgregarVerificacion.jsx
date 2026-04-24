import { useState } from "react";
import SubirArchivo from "../../../components/ui/SubirArchivo";
import Button from "../../../components/ui/Button";
import { useEffect } from "react";
import { apiCall } from "../../../services/api";
import { limpiarNombreArchivo } from "../../../services/formatearNombreArchivo";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AgregarVerificacion({instrumento, onSuccess}){

    const [file, setFile] = useState(null);
    const [date, setDate] = useState(null)
    const [curDate, setCurDate] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(()=>{
        if(curDate){
            const fechaActual = new Date();
            setDate(fechaActual)
        }
        else{
            setDate(null);
        }
    },[curDate]);

    const subirArchivo = async ()=>{ 

        if(!date){
            setError("Es obligatorio especificar la fecha");
            return;
        }
        if(!file){
            setError("Es obligatorio adjuntar un archivo de verificación");
            return;
        }
        try{
            setError("");
            setLoading(true);

            const { signedUrl, path, uploadToken } = await apiCall(`${API_URL}/api/instrumentos/verificacion`, {
                method: 'POST',
                body: JSON.stringify({
                    fileName: limpiarNombreArchivo(file.name), 
                    fileType: file.type, 
                    fileSize: file.size,
                })
            });

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
                    path: path,
                    fechaVigencia: date,
                    instrumento: instrumento
            };

            //3. Enviar los datos del plano al backend
            const respuesta = await apiCall(`${API_URL}/api/instrumentos/guardar-verificacion/${instrumento.id_instrumento}`, {
                method: 'POST', 
                body: JSON.stringify(payload)
            });

            if(onSuccess) onSuccess();

        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    };

    return (
        <>
            <SubirArchivo
                onUpload={(file)=> file.length > 0 ? setFile(file[0]) : setFile(null)} 
                acceptedFileTypes={["image/png", "image/jpeg", "application/pdf"]}
                onRemove={()=>setFile(null)}
            ></SubirArchivo>
            <div style={{display:"flex", gap:"5px"}}>
                <input type="checkbox" onChange={()=>setCurDate(!curDate)} checked={curDate}/>
                <span>Utilizar fecha actual</span>
            </div>

            {!curDate &&
                <input type="date" onChange={(e)=>setDate(new Date(e.target.value))}></input>
            }
            
            <Button
                variant="default"
                onClick={subirArchivo}
                disabled={!file || loading ? true: false}
            >
                Guardar
            </Button>

            {error &&
                <p style={{color: 'red'}}>{error}</p>
            }
        </>
    );
}