import { asociarComponentes, editarComponente, eliminarComponente } from "../services/component.service.js";


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

export const edicionComponente = async(req, res)=>{
    try {
      const { idPiezaPadre, idPiezaHijo, cantidad } = req.body;

      const resultado = await editarComponente(idPiezaPadre, idPiezaHijo, cantidad);

      return res.status(200).json({
          success: true,
          message: "Cantidad de componente actualizada correctamente.",
          data: resultado
      });

    } catch (error) {
        console.error("[edicionComponente] Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Ocurrió un error interno al intentar editar el componente." 
        });
    }
}

export const eliminacionComponente = async (req, res)=>{
  try{
    const {idPiezaPadre, idPiezaHijo} = req.query;

    console.log("Parametros: ",req.query);

    const data = await eliminarComponente(idPiezaPadre, idPiezaHijo);
    return res.status(200).json({message: "Eliminación exitosa", data: data});

  }catch(err){
    return res.status(500).json({error: err.message});
  }
}
