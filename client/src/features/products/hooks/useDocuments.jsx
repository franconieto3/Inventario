import { useEffect, useState } from "react"
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useDocuments = ()=>{
    const [tiposDocumento,setTiposDocumento] = useState([]);

    const [loadingAux, setLoadingAux] = useState(false);

    useEffect(()=>{
        const fetchTipos = async ()=>{
            try{
                setLoadingAux(true);
                const data = await apiCall(`${API_URL}/api/documentos/tipo-documento`,{method:'GET'});
                setTiposDocumento(data);
            }catch(err){
                console.error("Error cargando tipos de documentos", err);
                setLoadingAux(false);
            }finally{
                setLoadingAux(false);
            }    
        }
        fetchTipos();
    },[])

    const verDocumento = async(pathArchivo)=>{
        try {
            const params = new URLSearchParams({ path: pathArchivo });

            const {signedUrl} = await apiCall(`${API_URL}/api/documentos/obtener-url-documento?${params.toString()}`,
                {
                    method:'GET',
                });
            window.open(signedUrl, '_blank');

        } catch (err) {
            alert(err.message); // O usa un estado setError para mostrarlo bonito
        }
    } 

    return {
        tiposDocumento,
        loadingAux,
        verDocumento
    };
}