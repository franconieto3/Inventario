import reactLogo from './assets/react.svg'
import logo from './assets/logo.png';
import './App.css'
import ProductSection from "./components/ProductSection";
import NewProduct from "./components/NewProduct";
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
          </div>
          <ProductSection />
        </>);
}

export default App;