// Componentes
import ProductItem from "./ProductItem";
import NewProduct from "./NewProduct";
import logo from '../../assets/logo.png';
import NavBar from '../NavBar';
import { useState , useEffect} from "react";

//Estilos
import "../../styles/ProductSection.css"
import BodyContainer from "../BodyContainer";
import { useNavigate } from "react-router-dom";

/*
const listadoProductos = [{id:1, nombre:"Tallo Charnley", piezas:[{}]}, 
                        {id:2, nombre:"Cotilo Muller", piezas:[{}]},
                        {id:3, nombre:"Tallo Thopmson", piezas:[{}]},
                        {id:4, nombre:"Cotilo no cementado", piezas:[{}]}]
*/

export default function ProductSection(){

    const [showNewProduct, setShowNewProduct] = useState(false);
    const [productos, setProductos] = useState([]);
    const [registrosPM, setRegistrosPM] = useState([]);
    const [rubros, setRubros] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAuxData = async () => {
            const token = localStorage.getItem('token');
            if (!token) navigate('/login'); // Si no hay token, no intentamos buscar nada

            setLoadingData(true);
            try {
                // Hacemos ambas peticiones en paralelo
                const [resRubros, resPM, resProductos] = await Promise.all([
                    fetch('http://localhost:4000/rubros', {
                        headers: { 'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:4000/registros-pm', {
                        headers: {'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:4000/productos', {
                        headers: {'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!resRubros.ok || !resPM.ok || !resProductos.ok) {
                    throw new Error("Error obteniendo listas auxiliares");
                }

                const dataRubros = await resRubros.json();
                const dataPM = await resPM.json();
                const dataProductos = await resProductos.json();


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
            alert("Error: No has iniciado sesión.");
            return;
        }

        try {
            // 2. Petición al Backend
            // Ajusta el puerto 4000 si tu servidor corre en otro
            const response = await fetch('http://localhost:4000/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Header requerido por tu middleware 'verificarToken'
                },
                body: JSON.stringify(payload) // El payload ya viene limpio desde NewProduct
            });

            const data = await response.json();

            // 3. Verificar si hubo error en el servidor
            if (!response.ok) {
                throw new Error(data.error || "Error desconocido al crear producto");
            }


            // Opcional: Podrías hacer un fetch() nuevo para traer la lista real actualizada
            setProductos(prev => [...prev, {"id_producto": data.id_producto, "nombre": data.name}]);
            
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
            <BodyContainer>
                <div className='logo-container'>
                    <img className="logo-img" src={logo} alt="logo"></img>
                    <span className='logo-text'>BIOPROTECE S.A.</span>
                </div>
                <div className='title-container'>
                    <div>
                    <p className='products-text'>Productos</p>
                    <p className='products-count'>{`${productos.length}`} productos</p>
                    </div>
                </div>

                <div className='filters'>
                    <div className='search-box'>
                        <input type='text' placeholder="Buscar productos..." />
                        <button className='btn-search'>
                            <span className="material-icons">search</span>
                        </button>
                    </div>
                    <div className='button-container'>
                        <button className='add-button'>Agregar registro de PM</button>
                        <button className='add-button'>Agregar rubro</button>
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
            </BodyContainer>
        </>
    );
}
