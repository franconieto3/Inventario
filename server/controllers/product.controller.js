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
        const { page = 1, limit = 20, rubro, registro_pm } = req.query;
        
        const filtros = {
            page: Number(page),
            limit: Number(limit),
            rubro: rubro ? Number(rubro) : null,
            registro_pm: registro_pm ? Number(registro_pm) : null
        };

        const productos = await productService.obtenerProductos(filtros);
        res.json(productos);

    }catch(err){
        console.error(err);
        res.status(500).json({error: err.message});
    }
}

export const nuevoProducto = async (req, res) =>{
    try {
        const { nombre, id_registro_pm, id_rubro, piezas } = req.body;
        /*
        // Validaciones básicas de entrada
        if (!nombre || !piezas || piezas.length === 0) {
            return res.status(400).json({ error: "Datos incompletos" });
        }
        //Validar que no hayan coincidencias de nombres y piezas entre piezas

        if(piezas.length > 1){
            //Falta de denominación
            if (piezas.some(p => !p.nombrePieza)) {
                const err = new Error("Hay al menos una pieza sin denominación");
                err.statusCode = 400;
                throw err;
            }

            //Nombres duplicados
            const nombres = piezas.map(p => p.nombrePieza);
            if (new Set(nombres).size !== nombres.length) {
                const err = new Error("Hay al menos dos piezas con la misma denominación");
                err.statusCode = 400;
                throw err;
            }
        }
        */
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
        if(err.statusCode){
            res.status(err.statusCode).json({error: err.message});
        }
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
        res.status(err.statusCode? err.statusCode: 500).json({error: err.message});
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
        res.status(err.statusCode? err.statusCode : 500).json({error: err.message});
    }

}

export const agregarPieza = async (req, res)=>{
    try{
        const {nombrePieza, codigo, idProducto } = req.body;

        //Verificar que no estén repetidos los códigos o los nombres
        const piezaVerificada = await productService.verificarPieza(nombrePieza, codigo, idProducto);

        const idPiezaCreada = await productService.crearPieza(nombrePieza, codigo, idProducto);
        
        res.status(201).json({
            message: "Pieza creada exitosamente",
            id: idPiezaCreada});

    }catch(err){
        console.error(err);
        res.status(err.statusCode? err.statusCode: 500).json({error: err.message});
    }
}

export const edicionPieza = async (req, res)=>{
    try{
        const {id} = req.params;
        const {nombre, codigo, idProducto} = req.body;

        //Verificación: dos piezas del mismo producto no pueden tener el mismo código o nombre
        const piezaVerificada = await productService.verificarPieza(nombre, codigo, idProducto , Number(id));

        //Servicios
        const data = productService.editarPieza(id, nombre, codigo, null);
        res.status(201).json({message: "Pieza editada correctamente"});
    
    }catch(err){
        console.error(err);
        res.status(err.statusCode? err.statusCode: 500).json({error:err.message});
    }
}

export const edicionProducto = async(req,res)=>{
    try{
        const {id} = req.params;
        const {nombre, idRubro, idRegistroPm} = req.body;
        
        //Validaciones
        if(nombre===""){
            res.status(400).json({error:"Es obligatorio especificar el nombre de la pieza"});
            return;
        }

        //Servicios
        const data = productService.editarProducto(id, nombre, idRegistroPm, idRubro);
        res.status(201).json({message: "Pieza editada correctamente"});
    
    }catch(err){
        console.error(err);
        res.status(err.statusCode? err.statusCode: 500).json({error : err.message});
    }    
    
}

export const eliminacionPieza = async (req,res)=>{
    try{
        const {id} = req.params;
        
        const seElimino = await productService.eliminarPieza(id);
        
        if (!seElimino) {
            return res.status(404).json({ 
                error: "No se encontró la pieza o ya estaba eliminada" 
            });
        }

        res.status(200).json({ message: "Pieza eliminada exitosamente" });

    }catch(err){
        console.error(err);
        res.status(err.statusCode? err.statusCode: 500).json({error: err.message});
    }
}

export const eliminacionProducto = async (req, res)=>{
    try{
        const {id} = req.params;
        
        const seElimino = await productService.eliminarProducto(id);

        if (!seElimino) {
            return res.status(404).json({ 
                error: "No se encontró el producto o ya estaba eliminado" 
            });
        }

        res.status(200).json({ message: "Producto eliminado exitosamente" });

    }catch(err){
        console.error(err);
        res.status(err.statusCode? err.statusCode: 500).json({error: err.message});
    }
}

export const piezas = async (req, res)=>{
    try{
        const data = await productService.obtenerPiezas();
        return res.status(200).json(data);
        
    }catch(err){
        console.error(err);
        res.status(err.statusCode? err.statusCode: 500).json({error: err.message});    
    }
}