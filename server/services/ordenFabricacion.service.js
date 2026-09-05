import * as ordenFabricacionRepo from "../repositories/ordenFabricacion.repositories.js";

// Estados de orden_fabricacion (ver roadmap.md, Requerimientos 9-14).
// El id 3 (antes "Aceptada/En Producción" combinado) ahora significa sólo "En Producción";
// "Aceptada" pasa a ser una fila nueva (id 7) para no requerir renumeración/migración
// sobre órdenes ya creadas (Requerimiento 14).
export const ESTADO_PENDIENTE_DISENO = 1;
export const ESTADO_PENDIENTE_MATERIALES = 2;
export const ESTADO_EN_PRODUCCION = 3;
export const ESTADO_PAUSADA = 4;
export const ESTADO_FINALIZADA = 5;
export const ESTADO_CANCELADA = 6;
export const ESTADO_ACEPTADA = 7;

const ESTADOS_ACTIVOS = [
    ESTADO_PENDIENTE_DISENO,
    ESTADO_PENDIENTE_MATERIALES,
    ESTADO_ACEPTADA,
    ESTADO_EN_PRODUCCION
];

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

    // Req. 10: una orden solo puede pasar a estado 2 con ruta asignada.
    // El pase a Aceptada ya no se hace por orden individual: es una única
    // acción a nivel de pedido (ver fn_aceptar_pedido_fabricacion), para
    // garantizar que se aceptan todas las órdenes del pedido en conjunto.
    // El pase a En Producción tampoco se hace por PATCH directo: lo dispara
    // la creación de la primera orden de trabajo al escanear el QR (Req. 16),
    // todavía no implementada.
    if (cambios.id_estado_of !== undefined) {
        if (cambios.id_estado_of === ESTADO_PENDIENTE_MATERIALES && !idRutaResultante) {
            const err = new Error("La orden no puede pasar a Pendiente Materiales sin tener una ruta de fabricación asignada.");
            err.statusCode = 400;
            throw err;
        }

        if (cambios.id_estado_of === ESTADO_ACEPTADA) {
            const err = new Error("Esta transición debe realizarse aceptando el pedido de fabricación.");
            err.statusCode = 400;
            throw err;
        }

        if (cambios.id_estado_of === ESTADO_EN_PRODUCCION) {
            const err = new Error("Esta transición debe realizarse creando la primera orden de trabajo de la orden de fabricación.");
            err.statusCode = 400;
            throw err;
        }
    }

    return await ordenFabricacionRepo.actualizarOrdenFabricacion(idOf, cambios);
};

// Cancela la orden indicada y, en cascada, todas sus órdenes hijas
// (fn_cancelar_orden_fabricacion se encarga del árbol completo y de
// no reabrir/sobreescribir órdenes ya finalizadas o canceladas).
export const cancelarOrden = async (idOf) => {
    return await ordenFabricacionRepo.cancelarOrdenFabricacion(idOf);
};
