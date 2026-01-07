import * as productService from "../services/product.service.js";
import { supabase } from "../config/supabase.js";

export const rubros = async (req, res)=>{
    try {
        const { data, error } = await supabase
            .from('rubro')
            .select('id_rubro, descripcion'); 

        if (error) throw new Error("Error al obtener rubros");
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}