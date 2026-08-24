

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
import { ValidacionMateriales } from './features/materiales/pages/ValidacionMateriales';
import { Procesos } from './features/procesos/pages/Procesos';
import { DocumentDetail } from './features/documentos/DocumentDetail';
import RightClickBlocker from './components/layout/RightClickBlocker';
import { Instrumentos } from './features/instrumentos/pages/Instrumentos';
import { InstrumentDetail } from './features/instrumentos/pages/InstrumentDetail';
import { Flujograma } from './features/procesos/pages/Flujograma';
import GenerarOrdenFabricacion from './features/produccion/pages/GenerarOrdenFabricacion';
import { DashboardProduccion } from './features/produccion/pages/DashboardProduccion';

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
                  <PrivateRoute permission="acceso_materiales">
                    <Materiales/>
                  </PrivateRoute>
                }
              />
              <Route
                path="/materiales/ordenes"
                element={
                  <PrivateRoute permission="acceso_compras">
                    <ValidacionMateriales/>
                  </PrivateRoute>
                }
              />
              <Route
                path='/procesos'
                element={
                  <PrivateRoute permission="acceso_procesos">
                    <Procesos/>
                  </PrivateRoute>
                }
              /> 
              <Route
                path='/supervision'
                element={
                  <PrivateRoute permission="acceso_supervision">
                    <DashboardProduccion></DashboardProduccion>
                  </PrivateRoute>
                }
              />
              <Route
                path='/instrumentos'
                element={
                  <PrivateRoute permission="acceso_instrumentos">
                    <Instrumentos/>
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
                    <RightClickBlocker>
                      <DocumentDetail></DocumentDetail>
                    </RightClickBlocker>
                  </PrivateRoute>
                }
              />
              <Route
                path="/flujograma/new"
                element={
                  <PrivateRoute permission={'crear_rutas_procesos'}>
                    <Flujograma/>
                  </PrivateRoute>  
                }
              />
              <Route
                path="/flujograma/:id"
                element={
                  <PrivateRoute permission={'ver_rutas_procesos'}>
                    <Flujograma/>
                  </PrivateRoute>  
                }
              />
              <Route
                  path='/instrumento/:id'
                  element={
                    <PrivateRoute permission="ver_instrumentos">
                      <InstrumentDetail />
                    </PrivateRoute>
                  }
              />
              <Route
                  path='/supervision/generar-orden'
                  element={
                    <PrivateRoute permission={"crear_ordenes_fabricacion"}>
                      <GenerarOrdenFabricacion />
                    </PrivateRoute>
                  }
              />
            </Routes>
          </BrowserRouter>
        </AuthContextProvider>
        </>);
}

export default App;