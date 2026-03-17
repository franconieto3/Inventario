import { getProcesos, getTiposProcesos, getUnidadesTiempo } from "../services/process.service.js";


export const obtenerTiposProcesos = async (req, res) => {
  try {

    const tipos = await getTiposProcesos();
    return res.status(200).json(tipos);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerUnidadesTiempo = async (req, res)=>{
  try{
    const unidades = await getUnidadesTiempo();
    return res.status(200).json(unidades);

  }catch(err){
    res.status(500).json({ error: err.message });
  }
}

export const listarProcesos = async (req, res)=>{
  try {
    const { page, limit, id_tipo_proceso} = req.query;

    const result = await getProcesos({ 
      page: page? parseInt(page) : undefined, 
      limit: limit ? parseInt(limit): undefined ,
      id_tipo_proceso
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}