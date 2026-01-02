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
                
                setRubros(dataRubros);
                setRegistrosPM(dataPM);
                setProductos(dataProductos);

            } catch (error) {
                console.error("Error cargando listas:", error);
            } finally {
                setLoadingData(false);
            }
        };
        
        fetchAuxData();
    }, []);

    const handleProductCreated = (newProductData) => {
        // 1. Actualizamos la lista localmente para evitar un re-fetch
        setProductos(prev => [...prev, {
            id_producto: newProductData.id_producto, 
            nombre: newProductData.nombre
        }]);
        // 2. Cerramos el modal
        setShowNewProduct(false);
    };   

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
                        <button className='add-button' onClick={()=>setShowNewProduct(true)}>Agregar producto</button>
                    </div>
                </div>
                <div className='product-list'>
                    <div className='product-list-header'>Nombre</div>
                    {items}
                </div>
                {showNewProduct && (
                    <NewProduct 
                        onClose={()=>setShowNewProduct(false)} 
                        onSuccess={handleProductCreated} 
                        registros = {registrosPM} 
                        rubros = {rubros}/>
                )}
            </div>
        </>
    );
}
