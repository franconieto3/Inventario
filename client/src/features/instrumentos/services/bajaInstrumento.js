import { apiCall } from "../../../services/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const bajaInstrumento = async (id)=>{
    try{
      const res = await apiCall(`${API_URL}/api/instrumentos/baja/${id}`, {method: 'PUT'});
      return true;
      
    }catch(err){
      console.log(err.message);
      alert("Hubo un problema al intentar dar de baja el instrumento");
      return false;
    }
};