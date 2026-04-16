import { supabase } from "../config/supabase";

export const checkDocumentAccess = async (req, res)=>{
    const {data, error} = await supabase
    .from('solicitud_acceso_documento')
    .select('*')
    .eq('id_solicitante', idSolicitante)
    .eq('id_version', idVersion)
    .single();
}