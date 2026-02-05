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

        const data = await productService.cargarProductos(nombre, id_registro_pm, id_rubro, piezas);

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

export const producto = async (req, res)=>{
    try {

        const { id } = req.params;

        const [productoRes, documentosRes] = await productService.obtenerProducto(id);

        // Combinamos los datos
        const respuestaFinal = {
            ...productoRes.data,
            planos: documentosRes.data || []
        };
        
        res.json(respuestaFinal);

    } catch (err) {
        console.error(err);
        if(err.message === 'PGRST116'){
            res.status(404).json({ error: "Producto no encontrado" });
        }else{
            res.status(500).json({ error: "Error al obtener el detalle del producto" });
        }
    }
}

export const pieza = async (req, res) =>{
    try{
        const {id} = req.params;
        
        const [piezaRes, documentosRes] = await productService.obtenerInfoPieza(id); 

        const respuestaFinal = {
            ...piezaRes.data,
            documentos: documentosRes.data || []
        };

        res.status(200).json(respuestaFinal);

    }catch(err){
        console.error(err);
        if (err.message === 'PGRST116') {
            res.status(404).json({ error: "Pieza no encontrada" });
        } else {
            res.status(500).json({ error: "Error al obtener el detalle de la pieza" });
        }
    }

}

export const agregarPieza = async (req, res)=>{
    try{

        const {nombrePieza, codigoAm, idProducto } = req.body;

        //Verificar que no estén repetidos los códigos o los nombres

        const idPiezaCreada = await productService.crearPieza(nombrePieza, codigoAm, idProducto);
        
        res.status(200).json();

    }catch(err){
        console.error(err);
        res.status(err.statusCode? err.statusCode: 500).json(err.message);
    }
}