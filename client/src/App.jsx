

import { BrowserRouter,Routes, Route, Link} from 'react-router-dom'

import HomePage from './pages/HomePage';
import PrivateRoute from './routes/PrivateRoute';

import { AuthContextProvider } from "./features/auth/context/AuthContext";
import Login from './features/auth/components/Login';
import Register from "./features/auth/components/Register";

import ProductsPage from './features/products/pages/ProductsPage';
import ProductDetail from "./features/products/pages/ProductDetail";
import { Ingenieria } from './features/ingenieria/pages/Ingenieria';
import { Materiales } from './features/materiales/pages/Materiales';
import { Procesos } from './features/procesos/pages/Procesos';
import { DocumentDetail } from './features/documentos/DocumentDetail';

function App() {

  return (  
        <>
        <AuthContextProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              
               
            {/* Rutas Privadas */}
            <Route 
              path="/register" 
              element={
                <PrivateRoute permission="acceso_usuarios">
                  <Register />
                </PrivateRoute>
              } 
            />
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
                <PrivateRoute permission="acceso_repositorio">
                  <ProductsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/ingenieria"
              element={
                <PrivateRoute permission="acceso_ingenieria">
                  <Ingenieria/>
                </PrivateRoute>
              }
            />
            <Route
              path="/materiales"
              element={
                <PrivateRoute permission={null}>
                  <Materiales/>
                </PrivateRoute>
              }
            />
            <Route
              path='/procesos'
              element={
                <PrivateRoute permission={null}>
                  <Procesos/>
                </PrivateRoute>
              }
            /> 
            <Route 
              path="/producto/:id" 
              element={
                <PrivateRoute permission="acceso_repositorio">
                  <ProductDetail />
                </PrivateRoute>
                } 
            />
            <Route
              path="/documento/:id"
              element={
                <PrivateRoute permission={null}>
                  <DocumentDetail></DocumentDetail>
                </PrivateRoute>
              }
            />
            </Routes>
          </BrowserRouter>
        </AuthContextProvider>
        </>);
}

export default App;