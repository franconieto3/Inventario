import { useState } from "react";
import SubirArchivo from "../../../components/ui/SubirArchivo";
import Button from "../../../components/ui/Button";

export function AgregarArchivo(){

    const [file, setFile] = useState(null);

    const subirArchivo = ()=> console.log("subiendo archivo...");

    return (
        <>
            <SubirArchivo
                onUpload={(file)=> file.length > 0 ? setFile(file[0]) : setFile(null)} 
                acceptedFileTypes={["image/png", "image/jpeg"]}
                onRemove={()=>setFile(null)}
            ></SubirArchivo>

            <Button
                variant="default"
                onClick={subirArchivo}
                disabled={file? true: false}
            >
                Guardar
            </Button>
        </>
    );
}