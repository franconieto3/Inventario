import { useState } from "react";
import { apiCall } from "../../../services/api";
import { useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useSectores(){

    const [sectores, setSectores] = useState([]);

    const fetchSectores = async () => {
    try {
        const data = await apiCall(`${API_URL}/api/sectores/listado`, {})
        setSectores(data);
    } catch (err) {
        console.error("Error al cargar los sectores:", err);
    }
    };

    useEffect(() => {
        fetchSectores();
    }, []);

    return {sectores}
}