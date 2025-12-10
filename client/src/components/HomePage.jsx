import React from 'react';

import NavBar from './NavBar';
import "../styles/HomePage.css"
import { useNavigate } from 'react-router-dom';

export default function HomePage(){
    const navigate = useNavigate();
    return(
    <>
        <div>
            <NavBar />
            <div className='body-container'>
                <h1 style={{"margin-bottom":"30px"}}>¡Bienvenido!</h1>
                <div className="cards-container">
                    <div className="card" onClick={()=>navigate("/products")}>
                        <div className='icons-container'>
                            <div className="first-icon">
                                <i className="material-icons" id="inventory">inventory</i>
                            </div>
                            <i className="material-icons" style={{"font-size":"2rem", "color":"rgb(97, 97, 97)"}}>arrow_outward</i>
                        </div>
                        <div className='card-title'>
                            <h1>Información de productos</h1>
                        </div>
                        <p className='card-description'>Acceder a información básica de productos: piezas, planos, materiales y procesos</p>

                    </div>

                    <div className="card" onClick={()=>navigate("/register")}>
                        <div className='icons-container'>
                            <div className="first-icon">
                                <i className="material-icons">person</i>
                            </div>
                            <i className="material-icons" style={{"font-size":"2rem", "color":"rgb(97, 97, 97)"}}>arrow_outward</i>
                        </div>
                        <div className='card-title'>
                            <h1>Usuarios</h1>
                        </div>
                        <p className='card-description'>Registrar nuevos usuarios</p>
                    </div>

                </div>
            </div>
        </div>
    </>);
}