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

    const mappedMateriales = result.materiales.map((item)=>(
      {
        ...item, 
        'descripcion_rubro': item.rubro_material?.descripcion, 
        'descripcion_unidad': item.unidad_medida?.descripcion
      }
    ));

    res.json({
        ...result,
        materiales: mappedMateriales
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validación básica
    if (!id) {
      return res.status(400).json({ error: 'El ID del material es requerido' });
    }

    if (!updateData.descripcion || updateData.descripcion.trim() === '') {
      return res.status(400).json({ error: 'La descripción es obligatoria' });
    }

    // Llamamos al servicio para ejecutar la lógica de negocio
    const materialActualizado = await MaterialService.actualizarMaterial(id, updateData);

    return res.status(200).json({
      message: 'Material actualizado con éxito',
      data: materialActualizado
    });

  } catch (error) {
    console.error('Error en updateMaterial:', error);
    
    // Devolvemos un 400 o 500 dependiendo de si es un error de negocio o de servidor
    const statusCode = error.message.includes('Ya existe') ? 400 : 500;
    return res.status(statusCode).json({ error: error.message });
  }
};

export const eliminacionMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'El ID del material es requerido' });
    }

    await MaterialService.eliminarMaterial(id);
    
    return res.status(200).json({ message: 'Material eliminado con éxito' });
  } catch (err) {
    console.error('Error en eliminacionMaterial:', err);
    return res.status(500).json({ error: err.message });
  }
};

export const obtenerMaterialesSelector = async (req, res) => {
  try {
    const materiales = await MaterialService.getMaterialesParaSelector();
    const mappedMateriales = materiales.map(
      (item)=>({...item, 'unidad': item.unidad_medida?.unidad})
    )

    res.json(mappedMateriales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const asociarPieza = async (req, res) => {
  try {
    const { idPieza, materiales } = req.body;

    // Validaciones básicas
    if (!idPieza) {
      return res.status(400).json({ error: 'El ID de la pieza es requerido.' });
    }

    if (!materiales || !Array.isArray(materiales) || materiales.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista válida de materiales.' });
    }

    // Llamada al servicio
    await MaterialService.agregarMaterialPieza(idPieza, materiales);
    
    return res.status(201).json({ message: "Materiales asociados a la pieza correctamente." });
    
  } catch(err) {
    console.error('Error en asociarPieza:', err);
    return res.status(500).json({ error: err.message, message: err.message });
  }
}

export const quitarMaterial= async(req, res)=>{
  try{
    
    const {idBom} = req.query;
    const data = await MaterialService.quitarMaterialPieza(idBom);
    return res.status(200).json({message: "Material removido exitosamente", data: data});

  }catch(err){
    console.log(err);
    return res.status(500).json({error: err.message});
  }
}

export const edicionBom = async( req, res) =>{
  try{
    const {id_bom, consumo_teorico} = req.body;
    const data = await MaterialService.modificarBom(id_bom, consumo_teorico);
    
    return res.status(200).json({message: "Petición recibida correctamente"});
    
  }catch(err){
    console.error(err.message);
    return res.status(err.statusCode? err.statusCode : 500).json({error: err.message, message: err.message});
  }
}