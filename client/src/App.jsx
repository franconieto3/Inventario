import reactLogo from './assets/react.svg'
import logo from './assets/logo.png';
import './App.css'

import { useEffect, useState } from "react";

function App() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/")
      .then(res => res.text())
      .then(data => setMensaje(data));
  }, []);

  return (  
        <>
          <div className='logo-container'>
            <img className="logo-img" src={logo} alt="logo"></img>
            <span className='logo-text'>BIOPROTECE S.A.</span>
          </div>
          <div className='title-container'>
            <div>
            <p className='products-text'>Productos</p>
            <p className='products-count'>21 productos</p>
            </div>
            <button className='add-button'>Agregar producto</button>
          </div>
          <div className='input-container'>
            <input type='text'></input>
            <button>Buscar</button>
          </div>
          <div className='categories-container'>
            <div className='categories-header'>Nombre</div>
            <div className='category'>
              <i class="material-icons">folder</i>
              <span>PM-01 - Prótesis de cadera</span>
            </div>
            <div className='category'>
              <i class="material-icons">folder</i>
              <span>PM-02 - Clavos endomedulares de acero</span>
            </div>
          </div>
          <h1>{mensaje}</h1>
        </>);
}

export default App;