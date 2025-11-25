import React from 'react';
import { UserAuth } from '../context/authContext';
//Estilos
import "../styles/NavBar.css"

export default function NavBar(){
    const { user, logout} = UserAuth();

    const handleLogOut = async ()=>{
        try{
            await logout();
        }catch(err){
            setError(err.message);
        }
    }
    
    return(
    <>
        <nav>
            <div className='nav-bar'>{user? `${user.name}`: none}
                <button onClick={handleLogOut}>Cerrar sesión</button>
            </div>
            
        </nav>
    </>);
}