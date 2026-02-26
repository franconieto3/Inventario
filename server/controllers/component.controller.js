
export const asociarPiezas = async (req, res) => {
  try {
    const { idPiezaPadre, componentes } = req.body;

    //const resultado = await composicionService.asociarComponentes(idPiezaPadre, componentes);

    return res.status(201).json({
      success: true,
      message: "Componentes asociados exitosamente",
      //data: resultado
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

