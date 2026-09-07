// Req. 12: vista previa de la explosión de componentes de una pieza ensamble.
// Lista plana ordenada por "ruta" (ya viene así del backend, padres antes que hijos),
// indentada por nivel. Descartar un nodo deshabilita (y descarta) a sus descendientes.
export function SugerenciasComposicion({ nombreRaiz, idPieza, sugerencias, aprobadas, onToggle }) {
    if (!sugerencias || sugerencias.length === 0) return null;

    return (
        <div className="of-sugerencias-raiz">
            <p className="of-sugerencias-titulo">Componentes sugeridos para {nombreRaiz} (se generaran nuevos pedidos para cada componente)</p>
            <ul className="of-sugerencias-lista">
                {sugerencias.map((nodo) => {
                    const rutaKey = nodo.ruta.join('.');
                    const rutaPadreKey = nodo.ruta_padre.join('.');
                    const padreAprobado = rutaPadreKey === String(idPieza) || aprobadas.has(rutaPadreKey);
                    const marcado = aprobadas.has(rutaKey);

                    return (
                        <li
                            key={rutaKey}
                            className="of-sugerencia-item"
                            style={{ paddingLeft: `${nodo.nivel * 20}px` }}
                        >
                            <label className="of-sugerencia-checkbox">
                                <input
                                    type="checkbox"
                                    checked={marcado}
                                    disabled={!padreAprobado}
                                    onChange={(e) => onToggle(nodo.ruta, e.target.checked)}
                                />
                                <span>{nodo.nombre_producto} {nodo.nombre}</span>
                                {nodo.es_ensamble && <span className="of-pieza-badge">Ensamble</span>}
                                <span className="of-sugerencia-cantidad">x{nodo.cantidad}</span>
                            </label>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
