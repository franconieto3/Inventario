import * as ordenFabricacionRepo from "../repositories/ordenFabricacion.repositories.js";

export const crearOrdenesMasivo = async (ordenes) => {
    return await ordenFabricacionRepo.crearOrdenesFabricacionMasivo(ordenes);
};
