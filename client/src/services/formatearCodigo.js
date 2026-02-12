export default function formatearCodigo(idRubro, codigo) {

    if(!idRubro || !codigo){
        return "Sin definir";    
    }
    else{
        const rubro = String(idRubro).padStart(2, "0");
        const cod = String(codigo).padStart(3, "0");
        return `${rubro}-${cod}-XX`;
    }
}