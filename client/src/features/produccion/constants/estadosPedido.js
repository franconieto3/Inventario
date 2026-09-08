// Estados de pedido_fabricacion.id_estado_pedido (seed: 1 Pendiente, 2 Aceptado,
// 3 En Producción, 4 Finalizado, 5 Cancelado). Distinta de la máquina de estados de
// orden_fabricacion.id_estado_of (ver ESTADO_* en hooks/useOrdenesActivas.jsx).
export const ESTADO_PEDIDO_PENDIENTE = 1;
export const ESTADO_PEDIDO_ACEPTADO = 2;
export const ESTADO_PEDIDO_EN_PRODUCCION = 3;
export const ESTADO_PEDIDO_FINALIZADO = 4;
export const ESTADO_PEDIDO_CANCELADO = 5;

// Req. 15: solo se puede imprimir un pedido en uno de estos estados.
export const ESTADOS_PEDIDO_IMPRIMIBLES = [ESTADO_PEDIDO_ACEPTADO, ESTADO_PEDIDO_EN_PRODUCCION];
