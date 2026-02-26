import { useEffect, useState } from "react";
import { apiCall } from "../../../services/api";
import Buscador from "../../../components/ui/Buscador";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function BuscadorPiezas ({onSelect}){
    
    const [piezas, setPiezas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        const fetchPiezas = async ()=>{
            try{
                setLoading(true)
                const res = await apiCall(`${API_URL}/api/productos/listado-piezas`,{});
                setPiezas(res);
            }catch(err){
                console.log(err)
            }finally{
                setLoading(false);
            }
        }
        fetchPiezas();
        }
        ,[])

    return (
        <>
        
        <Buscador
            opciones={piezas}
            placeholder="Buscar piezas"
            keys={['id_pieza','nombre_completo']}
            onChange={(id, value)=>{onSelect(id,value)}}
            idField='id_pieza'
            displayField='nombre_completo'
            showId={false}
        />
        </>
    );    
}