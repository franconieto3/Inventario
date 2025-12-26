import React from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo.png';
//Estilos
import "../styles/NavBar.css"

export default function NavBar(){
    const { user, logout} = UserAuth();
    const navigate = useNavigate();

    const handleLogOut = async ()=>{
        try{
            await logout();
        }catch(err){
            setError(err.message);
        }
    }

    const getInitials = (fullName) =>{
        return fullName
            .trim()
            .split(/\s+/)      
            .map(word => word[0].toUpperCase())
            .join('');
        }
    
    return(
    <>
        <div className='nav-bar'>
            <div className='logo-container' onClick={()=>navigate('/HomePage')}>
                <img className="logo-img" src={logo} alt="logo"></img>
                <span className='logo-text'>BIOPROTECE S.A.</span>
            </div>
            <div className='user-container'>
                <button className='user-button'> {user? `${getInitials(user.name)}`: none }</button>
                <button className='logout-button' onClick={handleLogOut}>
                    <div>
                    <i className="material-icons">logout</i>
                    </div>
                </button>
            </div>
            
        </div>
    </>);
}