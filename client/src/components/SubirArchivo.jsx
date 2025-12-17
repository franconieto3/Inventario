import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export default function SubirArchivo( {onUpload} ){
    const [selected, setSelected] = useState([]);

    useEffect(()=>onUpload(selected),[selected])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: {
        "application/pdf": [] 
    },
    onDrop: (acceptedFiles) => setSelected(acceptedFiles),
    });

    const removeFile = (fileName) => {
    setSelected((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    };
    
    return(
        <>
        {/* Dropzone */}
        <div style={selected.length===0?{"display":"block"}:{"display":"none"}}> 
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? "active" : ""}`}
            >
                <input {...getInputProps()} id="file-upload" />
                {isDragActive ? (
                <p>Suelte el archivo aquí.</p>
                ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <i className="material-icons">file_copy</i>
                    <p>Arrastre y suelte el archivo aquí, o haga click para seleccionar</p>
                </div>
                )}
            </div>
            <p className="card-description">Solo los archivos .pdf están permitidos</p>
        </div>
        {selected.length > 0 && (
        <ul className="file-list">
        {selected.map((file) => (
            <li key={file.name} className="file-item-card" >
            <div style={{"display":"flex","gap": "10px"}}>
                <div style={{"display":"flex"}}> 
                    <div className="file-icon-wrapper" >
                        <i className="material-icons">file_copy</i>
                    </div>
                    <div className="file-info">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{file.size/1000000} MB</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="delete-btn"
                    aria-label="Remove file"
                    onClick={() => removeFile(file.name)}
                >
                    <i className="material-icons">delete</i>
                </button>
            </div>
            </li>
        ))}
        </ul>
        )}
        </>
    );
}