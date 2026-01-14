import * as productService from "../services/product.service.js";

export const rubros = async (req, res)=>{
    try {
        const rubros = await productService.obtenerRubros();
        res.json(rubros);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const registrosPM = async (req, res) =>{
    try {
        const registros = await productService.obtenerRegistrosPm();
        res.json(registros);

    } catch (err) {
  
        console.error(err);
        res.status(500).json({ error: "Error al obtener registros PM" });
    }
}

export const productos = async (req, res)=>{
    try{
        const productos = await productService.obtenerProductos();
        res.json(productos);

    }catch(err){
        console.error(err);
        res.status(500).json({error: err.message});
    }
}

export const nuevoProducto = async (req, res) =>{
    try {
        const { nombre, id_registro_pm, id_rubro, piezas } = req.body;

        // Validaciones básicas de entrada
        if (!nombre || !piezas || piezas.length === 0) {
            return res.status(400).json({ error: "Datos incompletos" });
        }

        const data = await productService.cargarProductos();

        // Si todo salió bien
        res.status(201).json({ 
            message: "Producto y piezas creados exitosamente", 
            id_producto: data.id_producto,
            id_registro_pm: data.id_registro_pm,
            id_rubro: data.id_rubro,
            nombre: data.nombre 
        });

    } catch (err) {
        console.error("Error del servidor:", err);
        res.status(500).json({ error: err.message});
    }
}