import { useEffect, useState } from "react";
import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function useGetGraph(id){

    const [loadingData, setLoadingData] = useState(false);
    const [graphData, setGraphData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(()=>{

        if (!id) {
            setGraphData(null);
            return;
        }

        const fetchGraph = async ()=>{
            setLoadingData(true);
            setError(null);

            try{
                const data = await apiCall(`${API_URL}/api/procesos/ruta-procesos/${id}`, {method: 'GET'});

                setGraphData(data);

            }catch(err){
                setError(err.message);
            }finally{
                setLoadingData(false);
            }
        }

        fetchGraph();
    },[]);

    return {graphData, loadingData, error};
}