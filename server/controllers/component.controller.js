import { asociarComponentes, eliminarComponente } from "../services/component.service.js";


export const asociarPiezas = async (req, res) => {
  try {
    const { idPiezaPadre, componentes } = req.body;

    const resultado = await asociarComponentes(idPiezaPadre, componentes);

    return res.status(201).json({
      success: true,
      message: "Componentes asociados exitosamente",
      data: resultado
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const eliminacionComponente = async (req, res)=>{
  try{
    const {idPiezaPadre, idPiezaHijo} = req.params;
    const data = await eliminarComponente(idPiezaPadre, idPiezaHijo);

    return res.status(200).json({message: "Eliminación exitosa", data: data});

  }catch(err){
    return res.status(500).json({error: err.message});
  }
}
