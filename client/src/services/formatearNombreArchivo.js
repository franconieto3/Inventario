    export const limpiarNombreArchivo = (nombre) => {
        return nombre
        .normalize("NFD") // Descompone caracteres (á -> a + ´)
        .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
        .replace(/[^a-zA-Z0-9.\-]/g, "_"); // Reemplaza todo lo que no sea letra, número, punto o guion por "_"
    };