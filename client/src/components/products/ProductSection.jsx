// Componentes
import ProductItem from "./ProductItem";
import NewProduct from "./NewProduct";
import logo from '../../assets/logo.png';
import NavBar from '../NavBar';
import { useState , useEffect} from "react";

//Estilos
import "../../styles/ProductSection.css"
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import { apiCall } from "../../services/api";
import Buscador from "../Buscador";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ProductSection(){

    const [showNewProduct, setShowNewProduct] = useState(false);
    const [productos, setProductos] = useState([]);
    const [registrosPM, setRegistrosPM] = useState([]);
    const [rubros, setRubros] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const { logout } = UserAuth();
    const navigate = useNavigate();

    //Petción de rubros, listados de PM y productos al cargar el componente
    useEffect(() => {
        const fetchAuxData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                 logout(); // Asegurar limpieza
                 navigate('/login');
                 return;
            }

            setLoadingData(true);
            try {
                const [dataRubros, dataPM, dataProductos] = await Promise.all([
                    apiCall(`${API_URL}/rubros`,{}),
                    apiCall(`${API_URL}/registros-pm`,{}),
                    apiCall(`${API_URL}/productos`,{})
                ])

                // 4. Actualizamos el estado
                setRubros(dataRubros);
                setRegistrosPM(dataPM);
                setProductos(dataProductos);

            } catch (error) {
                console.error("Error cargando listas:", error);
                // Aquí podrías mostrar un toast o notificación
            } finally {
                setLoadingData(false);
            }
        };
        
        fetchAuxData();
    }, []);

    const handleAddProduct = async (payload) => {
        
        // 1. Obtener el token (asumiendo que lo guardaste en localStorage al loguear)
        const token = localStorage.getItem('token'); 

        if (!token) {
                logout(); // Asegurar limpieza
                navigate('/login');
                return;
        }

        try {
            const data = await apiCall(`${API_URL}/productos`, {method: 'POST', body: JSON.stringify(payload)});
            
            // Opcional: Podrías hacer un fetch nuevo para traer la lista real actualizada
            setProductos(prev => [...prev, {"id_producto": data.id_producto, "nombre": data.nombre}]);
            setShowNewProduct(false); // Cerramos el modal

        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un problema al guardar: " + error.message);
        }
    }

    const handleProductClick = (id) => {
        navigate(`/producto/${id}`); 
    };

    const items = productos.map((item) => (
        <ProductItem key={item.id_producto} id ={item.id_producto} name={item.nombre} onChange={handleProductClick}/>
    ));


    return (
        <>
            <NavBar />
            <div className='body-container'>
                <div className='title-container'>
                    <div>
                    <p className='products-text'>Repositorio de productos</p>
                    <p className='products-count'>{`${productos.length}`} productos</p>
                    </div>
                </div>
                

                
                <div className='filters'>
                    <div className='search-box'>
                        {/*
                        <input type='text' placeholder="Buscar productos..." />
                        <button className='btn-search'>
                            <span className="material-icons">search</span>
                        </button>
                        */}
                        <Buscador               
                            opciones={productos}
                            placeholder="Buscar productos..."
                            keys={['id_producto','nombre']}
                            onChange={(id)=>id!==0?navigate(`/producto/${id}`):null}
                            idField="id_producto"
                            displayField="nombre"
                            showId={false}
                        />
                    </div>
                    <div className='button-container'>
                        {/*
                            <button className='add-button'>Agregar registro de PM</button>
                            <button className='add-button'>Agregar rubro</button>
                        */}
                        <button className='add-button' onClick={()=>setShowNewProduct(true)}>Agregar producto</button>
                    </div>
                </div>

                <div className='product-list'>
                    <div className='product-list-header'>Nombre</div>
                    {items}
                </div>

                
                {showNewProduct && (
                    <NewProduct onClose={()=>setShowNewProduct(false)} onCreate={handleAddProduct} registros = {registrosPM} rubros = {rubros}/>
                )}
            </div>
        </>
    );
}
