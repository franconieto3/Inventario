import { Modal } from "../../../components/ui/Modal"

export function NuevaRutaProcesos({onClose}){
    return(
        <>
            <Modal
                titulo="Crear nueva ruta de procesos"
                descripcion="Seleccione y acomode el orden de procesos"
                onClose={onClose}
            >
                <p>Hola mundo</p>
            </Modal>
        </>
    )
}