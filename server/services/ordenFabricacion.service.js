import * as ordenFabricacionRepo from "../repositories/ordenFabricacion.repositories.js";

// Estados de orden_fabricacion (ver roadmap.md, Requerimiento 9)
export const ESTADO_PENDIENTE_DISENO = 1;
export const ESTADO_PENDIENTE_MATERIALES = 2;
export const ESTADO_ACEPTADA = 3;
export const ESTADO_PAUSADA = 4;
export const ESTADO_FINALIZADA = 5;

const ESTADOS_ACTIVOS = [ESTADO_PENDIENTE_DISENO, ESTADO_PENDIENTE_MATERIALES, ESTADO_ACEPTADA];

export const crearOrdenesMasivo = async (ordenes) => {
    return await ordenFabricacionRepo.crearOrdenesFabricacionMasivo(ordenes);
};

export const listarPendientesDiseno = async () => {
    return await ordenFabricacionRepo.listarOrdenesFabricacionPorEstados([ESTADO_PENDIENTE_DISENO]);
};

export const listarPendientesMateriales = async () => {
    return await ordenFabricacionRepo.listarOrdenesFabricacionPorEstados([ESTADO_PENDIENTE_MATERIALES]);
};

export const listarActivas = async () => {
    return await ordenFabricacionRepo.listarOrdenesFabricacionPorEstados(ESTADOS_ACTIVOS);
};

export const obtenerRutasPieza = async (idPieza) => {
    return await ordenFabricacionRepo.obtenerRutasPieza(idPieza);
};

export const actualizarOrden = async (idOf, cambios) => {
    const actual = await ordenFabricacionRepo.obtenerOrdenPorId(idOf);

    const idRutaResultante = cambios.id_ruta ?? actual.id_ruta;
    const idMateriaPrimaResultante = cambios.id_materia_prima ?? actual.id_materia_prima;

    // Req. 10: una orden solo puede pasar a estado 2 con ruta asignada,
    // y a estado 3 con materia prima asignada.
    if (cambios.id_estado_of !== undefined) {
        if (cambios.id_estado_of === ESTADO_PENDIENTE_MATERIALES && !idRutaResultante) {
            const err = new Error("La orden no puede pasar a Pendiente Materiales sin tener una ruta de fabricación asignada.");
            err.statusCode = 400;
            throw err;
        }

        if (cambios.id_estado_of === ESTADO_ACEPTADA && !idMateriaPrimaResultante) {
            const err = new Error("La orden no puede pasar a Aceptada sin tener una materia prima asignada.");
            err.statusCode = 400;
            throw err;
        }
    }

    return await ordenFabricacionRepo.actualizarOrdenFabricacion(idOf, cambios);
};
