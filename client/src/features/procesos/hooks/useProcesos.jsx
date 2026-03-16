import { useState } from "react"

export function useProcesos(){

    const [procesos, setProcesos] = useState([
        {
            id_proceso:1,
            nombre: "Mecanizado",
            objeto_proceso: "Fabricación",
            unidad_medicion: "horas"
        },
        {
            id_proceso: 2,
            nombre: "Corte por hilo",
            objeto_proceso: "Fabricación",
            unidad_medicion: "horas"
        },
        {
            id_proceso: 3,
            nombre: "Anodizado",
            objeto_proceso: "Fabricación",
            unidad_medicion: "horas"
        },
        {
            id_proceso: 4,
            nombre: "Grabado",
            objeto_proceso: "Loteo",
            unidad_medicion: "horas"
        },
        {
            id_proceso: 5,
            nombre: "Envasado",
            objeto_proceso: "Loteo",
            unidad_medicion: "horas"
        },
        {
            id_proceso: 6,
            nombre: "Impresión 3D",
            objeto_proceso: "Fabricación",
            unidad_medicion: "días"
        }
    ]);

    const [rutas, setRutas] = useState([
        {
          id_ruta:1,
          nombre: "Tornillos canulados"  
        },
        {
            id_ruta: 2,
            nombre: "Placas de titanio"
        },
        {
            id_ruta: 3,
            nombre: "Tallos de cadera acero"
        }
    ])

    return {procesos, rutas}
}