import { supabase } from "../config/supabase.js";

export const crearOrdenesFabricacionMasivo = async (ordenes) => {
    const { data, error } = await supabase.rpc('fn_crear_ordenes_fabricacion_masivo', {
        p_ordenes: ordenes
    });

    if (error) {
        console.error("Error Supabase RPC (Ordenes Fabricacion Masivo):", error);
        const err = new Error(error.message || "Error al crear las órdenes de fabricación.");
        err.statusCode = error.code === '23503' ? 400 : 500;
        throw err;
    }

    return data;
};
