import { useState } from "react";
import SubirArchivo from "../../../components/ui/SubirArchivo";
import Button from "../../../components/ui/Button";
import { useEffect } from "react";
import { apiCall } from "../../../services/api";
import { limpiarNombreArchivo } from "../../../services/formatearNombreArchivo";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function AgregarArchivo({instrumento, tipos, onSuccess}){

    const [file, setFile] = useState(null);
    const [tipoSeleccionado, setTipoSeleccionado] = useState("");

    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const subirArchivo = async ()=> {

        if(!file){
            setError("Es obligatorio adjuntar un archivo");
            return;
        }
        if(!tipoSeleccionado){
            setError("Es obligatorio especificar el tipo de archivo");
            return;
        }
        
        try{
            setError("");
            setLoading(true);

            const { signedUrl, path, uploadToken } = await apiCall(`${API_URL}/api/instrumentos/archivo-auxiliar`, {
                method: 'POST',
                body: JSON.stringify({
                    fileName: limpiarNombreArchivo(file.name), 
                    fileType: file.type, 
                    fileSize: file.size,
                })
            });

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
                    tipoDocumento: tipoSeleccionado
            };

            //3. Enviar los datos del plano al backend
            const respuesta = await apiCall(`${API_URL}/api/instrumentos/guardar-archivo-auxiliar/${instrumento.id_instrumento}`, {
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
            <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
                <option value="" disabled>
                    Seleccione el tipo de documento a subir
                </option>
                {tipos &&
                    tipos.map(
                        (t)=>(
                            <option key={t} value={t}>
                                {t}
                            </option>
                        )
                    )
                }
            </select>
            {tipoSeleccionado &&
                <SubirArchivo
                    onUpload={(file)=> file.length > 0 ? setFile(file[0]) : setFile(null)} 
                    acceptedFileTypes={["image/png", "image/jpeg", "application/pdf"]}
                    onRemove={()=>setFile(null)}
                />
            }
            <Button
                variant="default"
                onClick={subirArchivo}
                disabled={!file || loading? true: false}
            >
                Guardar
            </Button>

            {error &&
                <p style={{color: 'red'}}>{error}</p>
            }
        </>
    );
}