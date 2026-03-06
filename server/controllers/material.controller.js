import * as MaterialService from '../services/material.service.js';

export const obtenerRubros = async (req, res) => {
  try {

    const rubros = await MaterialService.getRubros();
    return res.status(200).json(rubros);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerUnidades = async (req, res)=>{
  try{
    const unidades = await MaterialService.getUnits();
    return res.status(200).json(unidades);
  }catch(err){
    res.status(500).json({ error: err.message });
  }
}

export const crearMaterial = async (req, res) => {
  try {
    const {id_rubro_material, id_unidad_medida, descripcion, es_trazable, atributos} = req.body;
    const payload ={
      id_rubro_material: Number(id_rubro_material),
      id_unidad_medida: Number(id_unidad_medida),
      descripcion,
      es_trazable,
      atributos
    }
    const nuevoMaterial = await MaterialService.createMaterial(payload);
    res.status(201).json(nuevoMaterial);


  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listarMateriales = async (req, res) => {
  try {
    const { page, limit, id_rubro_material } = req.query;
    const result = await MaterialService.getMateriales({ 
      page: parseInt(page), 
      limit: parseInt(limit), 
      id_rubro_material 
    });

    console.log("Resultados: ", result)
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};