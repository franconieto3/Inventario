import { supabase, supabaseAdmin } from "../config/supabase.js";

export const asociarComponentes = async (idPiezaPadre, componentes) => {

    const idsComponentes = componentes.map(c => c.idComponente);

    // REGLA 1: Evitar que una pieza sea componente de sí misma
    if (idsComponentes.includes(idPiezaPadre)) {
        const err = new Error("Una pieza no puede tenerse a sí misma como componente.");
        err.statusCode = 400;
        throw err;
    }

    // REGLA 2: Evitar asociar piezas con el mismo id_producto
    // Obtenemos la pieza padre y los componentes en una sola consulta
    const { data: piezas, error: piezasError } = await supabase
        .from('pieza')
        .select('id_pieza, id_producto')
        .in('id_pieza', [idPiezaPadre, ...idsComponentes]);

    if (piezasError) throw new Error("Error al consultar las piezas en la base de datos.");

    const piezaPadre = piezas.find(p => p.id_pieza === idPiezaPadre);
    if (!piezaPadre) throw new Error("La pieza padre no existe.");

    const componentesMismoProducto = piezas.filter(
        p => p.id_pieza !== idPiezaPadre && p.id_producto === piezaPadre.id_producto
    );

    if (componentesMismoProducto.length > 0) {
        const err = new Error("No se pueden asociar componentes que pertenezcan al mismo producto que la pieza padre.");
        err.statusCode = 400;
        throw err;
    }

    // REGLA 3: Evitar loop infinito (Nivel 1: El hijo no puede ser padre del padre)
    // Buscamos si alguno de los componentes ya tiene al "idPiezaPadre" como su hijo
    const { data: loops, error: loopError } = await supabase
        .from('composicion_pieza')
        .select('id_pieza_padre, id_pieza_hijo')
        .in('id_pieza_padre', idsComponentes)
        .eq('id_pieza_hijo', idPiezaPadre);

    if (loopError) throw new Error("Error al verificar dependencias circulares.");
    if (loops && loops.length > 0) {
        throw new Error("Loop detectado: Uno de los componentes ya tiene a la pieza padre como su propio componente.");
    }

    // 4. Inserción masiva si todas las validaciones pasan
    const datosAInsertar = componentes.map(comp => ({
        id_pieza_padre: idPiezaPadre,
        id_pieza_hijo: comp.idComponente,
        cantidad: comp.cantidad
    }));

    const { data, error: insertError } = await supabase
        .from('composicion_pieza')
        .insert(datosAInsertar)
        .select();

    if (insertError) {
        // Manejo de violaciones de PK (ej: intentar insertar el mismo componente dos veces al mismo padre)
        if (insertError.code === '23505') {
        throw new Error("Uno de los componentes ya se encuentra asociado a esta pieza.");
        }
        throw new Error("Error al guardar la composición en la base de datos.");
    }

  return data;
};

export const eliminarComponente = async(idPadre, idHijo)=>{
    const {data, error} = await supabase.rpc('quitar_componente',{
        p_id_pieza_padre: idPadre,
        p_id_componente: idHijo
    });

    if(error){
        console.error(error);
        throw new Error("No se pudo quitar el componente");
    }

    return data;
}