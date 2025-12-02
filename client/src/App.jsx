
import ProductSection from "./components/products/ProductSection";
import { useEffect, useState } from "react";
import { BrowserRouter,Routes, Route, Link} from 'react-router-dom'
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AuthContextProvider } from './context/authContext';
import HomePage from './components/HomePage';
import PrivateRoute from './components/PrivateRoute';


function App() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/")
      .then(res => res.text())
      .then(data => setMensaje(data));
  }, []);

  return (  
        <>
        
        <AuthContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
               
            {/* Rutas Privadas */}
            <Route 
              path="/homepage" 
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              } 
            />
            <Route
              path="/products" 
              element={
                <PrivateRoute>
                  <ProductSection />
                </PrivateRoute>
              }
            />

            </Routes>
          </BrowserRouter>
        </AuthContextProvider>
        </>);
}

export default App;