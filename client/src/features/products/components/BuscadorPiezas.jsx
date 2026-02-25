import { useEffect, useState } from "react";
import { apiCall } from "../../../services/api";
import Buscador from "../../../components/ui/Buscador";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function BuscadorPiezas ({onSelect}){
    
    const [piezas, setPiezas] = useState(null);
    const [loading, setLoading] = useState(false);

    return (
        <>
        {/*
            <Buscador
                opciones={piezas}
                placeholder="Buscar piezas"
                keys={['id_pieza','nombre_completo']}
                onChange={(id)=>{onSelect(id)}}
                idField='id_pieza'
                displayField='nombre_completo'
                showId={false}
            />
        */}
        <p>Hola mundo</p>
        </>
    );    
}