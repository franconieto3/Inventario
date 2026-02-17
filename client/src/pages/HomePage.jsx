import React from 'react';
import { useNavigate } from 'react-router-dom';

import NavBar from '../components/layout/NavBar';

import "./HomePage.css"

export default function HomePage(){
    const navigate = useNavigate();
    return(
    <>
        <div>
            <NavBar />
            <div className='body-container'>
                <h1 style={{"marginBottom":"30px", "fontFamily":"Inter", "fontWeight":"300","fontSize":"2.5rem", "fontStyle":"normal"}}>¡Bienvenido!</h1>
                <div className="cards-container">
                    <div className="card" onClick={()=>navigate("/products")}>
                        <div className='icons-container'>
                            <div className="first-icon">
                                <i className="material-icons" id="inventory">inventory</i>
                            </div>
                            <i className="material-icons" style={{"fontSize":"2rem", "color":"rgb(97, 97, 97)"}}>arrow_outward</i>
                        </div>
                        <div className='card-title'>
                            <h1 style={{"fontFamily":"Inter","fontWeight":"500"}}>Registro maestro de productos</h1>
                        </div>
                        <p className='card-description'>Acceder a información básica de productos: piezas, planos, materiales y procesos</p>

                    </div>

                    <div className="card" onClick={()=>navigate("/register")}>
                        <div className='icons-container'>
                            <div className="first-icon">
                                <i className="material-icons">person</i>
                            </div>
                            <i className="material-icons" style={{"fontSize":"2rem", "color":"rgb(97, 97, 97)"}}>arrow_outward</i>
                        </div>
                        <div className='card-title'>
                            <h1 style={{"fontFamily":"Inter","fontWeight":"500"}}>Usuarios</h1>
                        </div>
                        <p className='card-description'>Registrar nuevos usuarios</p>
                    </div>

                </div>
            </div>
        </div>
    </>);
}