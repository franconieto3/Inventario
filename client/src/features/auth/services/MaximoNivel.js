export const maximoNivelRoles = (roles)=>{
    return Math.min(
        roles.map((r)=> r.nivel)
    )
}