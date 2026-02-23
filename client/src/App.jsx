

import { BrowserRouter,Routes, Route, Link} from 'react-router-dom'

import HomePage from './pages/HomePage';
import PrivateRoute from './routes/PrivateRoute';

import { AuthContextProvider } from "./features/auth/context/AuthContext";
import Login from './features/auth/components/Login';
import Register from "./features/auth/components/Register";

import ProductsPage from './features/products/pages/ProductsPage';
import ProductDetail from "./features/products/pages/ProductDetail";
import { Ingenieria } from './features/ingenieria/pages/Ingenieria';

function App() {

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
                  <ProductsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/ingenieria"
              element={
                <PrivateRoute>
                  <Ingenieria/>
                </PrivateRoute>
              }
            />
            <Route 
              path="/producto/:id" 
              element={
                <PrivateRoute>
                  <ProductDetail />
                </PrivateRoute>
                } 
            />
            </Routes>
          </BrowserRouter>
        </AuthContextProvider>
        </>);
}

export default App;