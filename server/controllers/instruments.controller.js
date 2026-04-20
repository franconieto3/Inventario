import { crearInstrumento, getInstrumentos, getSectores } from "../services/instruments.service.js";


export const nuevoInstrumento = async (req, res) => {
    try {
        const data = req.body;

        // Llamada al servicio
        const nuevoInstrumento = await crearInstrumento(data);

        // Respuesta exitosa
        return res.status(201).json({
            message: "Instrumento creado con éxito",
            data: nuevoInstrumento
        });

    } catch (error) {
        // Capturamos los errores lanzados desde el service y devolvemos un 400
        console.error("Error en crearInstrumento controller:", error.message);
        return res.status(400).json({ 
            message: error.message || "Error interno del servidor al procesar la solicitud" 
        });
    }
};

export const sectores = async (req, res) => {
    try {
      const sectores = await getSectores();
      return res.status(200).json(sectores);
    } catch (error) {
      console.error('[InstrumentosController.getSectores]', error);
      return res.status(500).json({ error: 'Error interno del servidor al cargar sectores' });
    }
}

export const instrumentos = async (req, res) => {
    try {
      // Extraemos y parseamos los query params recibidos desde el Hook de React
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { tipo, sectorId } = req.query;

      // Llamamos al servicio con los parámetros limpios
      const result = await getInstrumentos({
        page,
        limit,
        tipo,
        sectorId: sectorId ? parseInt(sectorId) : undefined
      });
      /*
      const now = new Date();
      const itemsConEstado = result.items.map((item)=>{

        if(item.tipo === 'ESTANDAR'){
            if (item.mes_vencimiento){
                const venc = new Date(item.mes_vencimiento);

                if (venc.getFullYear() < now.getFullYear() || 
                (venc.getMonth() < now.getMonth() && 
                venc.getFullYear() <= now.getFullYear())
                ){
                    return {...item, estado: "Caducado"}
                }else if (venc.getMonth() === now.getMonth() && venc.getFullYear() === now.getFullYear()){
                    return {...item, estado: "Por caducar"}
                }else{
                    return {...item, estado: "Verificado"}
                }  
            }
            else{
                return {...item, estado: null};
            }
        }
        else if (item.tipo === 'PROBADOR'){
            if(item.usos_maximos > 0 && item.usos_actuales >= 0){
                const diferencia = item.usos_maximos - item.usos_actuales;
                if (diferencia <= 0){
                    return {...item, estado: "Caducado"}
                }
                else if(diferencia > 0 && diferencia < 20){
                    return {...item, estado: "Por caducar"}
                }
                else{
                    return {...item, estado: "Verificado"}    
                }
            }else{
                return {...item, estado: null};
            }
        }
        else{
           return {...item, estado: null}
        }
      })*/

      // Retornamos el objeto con { items, total } que espera tu hook useInstruments
      return res.status(200).json({
        ...result,
        //items: itemsConEstado
        });

    } catch (error) {
      console.error('[InstrumentosController.getInstrumentos]', error);
      return res.status(500).json({ error: 'Error interno del servidor al cargar instrumentos' });
    }
  }