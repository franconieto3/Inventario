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
//Simulación de datos extraidos del backend
const listadoPM = [{id: 0, nombre: "Ninguno"},
                   {id: 1, nombre: "Cadera"},
                   {id: 2, nombre: "Clavos endomedulares"}]

const listadoRubros = [{id: 0, nombre: "Ninguno"},
                       {id: 13, nombre: "Bipolar"},
                       {id: 78, nombre: "Componente de fábrica"},
                    ]
*/
const listadoProductos = [{id:1, nombre:"Tallo Charnley", piezas:[{}]}, 
                        {id:2, nombre:"Cotilo Muller", piezas:[{}]},
                        {id:3, nombre:"Tallo Thopmson", piezas:[{}]},
                        {id:4, nombre:"Cotilo no cementado", piezas:[{}]}]




export default function ProductSection(){

    const [showNewProduct, setShowNewProduct] = useState(false);
    const [productos, setProductos] = useState([...listadoProductos]);
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
                const [resRubros, resPM] = await Promise.all([
                    fetch('http://localhost:4000/rubros', {
                        headers: { 'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:4000/registros-pm', {
                        headers: {'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!resRubros.ok || !resPM.ok) {
                    throw new Error("Error obteniendo listas auxiliares");
                }

                const dataRubros = await resRubros.json();
                const dataPM = await resPM.json();

                console.log("Datos recibidos de la API:", dataPM);

                // 4. Actualizamos el estado
                setRubros(dataRubros);
                setRegistrosPM(dataPM);

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

            // 4. Éxito
            alert(`Producto creado con éxito. ID: ${data.id_producto}`);
            
            // Actualizamos la lista visualmente (Optimista)
            // Opcional: Podrías hacer un fetch() nuevo para traer la lista real actualizada
            setProductos(prev => [...prev, payload]);
            
            setShowNewProduct(false); // Cerramos el modal

        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un problema al guardar: " + error.message);
        }
    }

    const items = productos.map((item, idx) => (
        <ProductItem key={item.id} name={item.nombre} />
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
                    <p className='products-count'>{`${listadoProductos.length}`} productos</p>
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
