import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Componentes
import ProductItem from "../components/ProductItem";
import NavBar from "../../../components/layout/NavBar";
import { useProducts } from "../hooks/useProducts";
import EdicionProducto from "../components/EdicionProducto";
import Buscador from "../../../components/ui/Buscador";
import NewProduct from "../components/NewProduct";
import Can from "../../../components/Can";
import Table from "../../../components/ui/Table";

//Estilos
import "./ProductsPage.css"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ProductsPage(){
    const navigate = useNavigate(); 

    const { 
        productos, 
        rubros, 
        registrosPM, 
        loadingProducts, 
        loadingAux,
        page,
        setPage,
        totalPages,
        refreshProducts
    } = useProducts();

    const [mostrarEdicion, setMostrarEdicion] = useState(false);
    const [showNewProduct, setShowNewProduct] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const handleProductClick = (id) => navigate(`/producto/${id}`); 

    const abrirModalEdicion = (producto)=>{
        setProductoSeleccionado(producto)
        setMostrarEdicion(true);
    }

    const handleCloseModal =()=>{
        setMostrarEdicion(false);
        setProductoSeleccionado(null);
        setShowNewProduct(false);
    }

    const handleSuccess = ()=>{
        handleCloseModal();
        refreshProducts();
    }

    // Handlers de Paginación
    const handlePrevPage = () => {
        if (page > 1) setPage(p => p - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(p => p + 1);
    };

    if (loadingAux && page === 1 && productos.length === 0) {
        return <div className="loading-state">Cargando productos...</div>;
    }
    
    return (
        <>
            <NavBar />
            <div className='body-container'>
                <div className='title-container'>
                    <div>
                        <p className='products-text'>Repositorio de productos</p>
                        <p className='products-count'>{`${productos.length}`} productos</p>
                        <p className='products-count'>
                                Página {page} de {totalPages || 1}
                        </p>
                    </div>
                </div>
                <div className='filters'>
                    <div className='search-box'>
                        {/* NOTA: Si hay paginación en el backend, este buscador local
                           solo buscará en los 20 productos visibles actualmente.
                           Para buscar en todo, el componente Buscador debería llamar a la API.
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
                    <Can permission="administrar_productos">
                        <div className='button-container'>
                            <button className='add-button' onClick={()=>setShowNewProduct(true)}>Agregar producto</button>
                        </div>
                    </Can>
                    
                </div>
                <div className='product-list'>
                    <div className='product-list-header'>Nombre</div>

                    {loadingProducts ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Cargando productos...</div>
                    ) : (
                    productos.map(
                        (item) => (
                            <ProductItem 
                                key={item.id_producto} 
                                producto={item} 
                                onChange={handleProductClick} 
                                onEdit={(prod) => abrirModalEdicion(prod)}
                                onDelete={handleSuccess}
                            />
                        ))
                    )}
                </div>
                
                {/*
                <Table 
                    data={productos} 
                    columns={
                        [
                            {
                                key:"nombre", 
                                header:"Nombre",
                                render: (_, row)=>(
                                    <div onClick={()=>navigate(`/producto/${row.id_producto}`)} style={{'cursor':'pointer'}}>
                                        {_}
                                    </div>
                                )
                            },
                            {
                                key:"descripcion_rubro", 
                                header:"Rubro"
                            },
                            {
                                key:"descripcion_registro", 
                                header:"Producto médico"
                            }
                        ]}>
                </Table>
                */}
                
                {/* Controles de Paginación */}
                {totalPages > 1 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        <button 
                            onClick={handlePrevPage} 
                            disabled={page === 1 || loadingProducts}
                            className="pagination-button" // Asegúrate de tener estilos o usa estilos inline
                        >
                            Anterior
                        </button>
                        <span>{page} / {totalPages}</span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={page === totalPages || loadingProducts}
                            className="pagination-button"
                        >
                            Siguiente
                        </button>
                    </div>
                )}

                {/* Modales */}
                {showNewProduct && (
                    <NewProduct 
                        onClose={handleCloseModal}
                        onSuccess={handleSuccess}
                        registros = {registrosPM} 
                        rubros = {rubros}/>
                )}
                {mostrarEdicion &&
                    <EdicionProducto 
                        producto={productoSeleccionado} 
                        rubros={rubros} 
                        registrosPM={registrosPM} 
                        onUploadSuccess={handleSuccess}
                        onClose={handleCloseModal}
                    />
                }
            </div>
        </>
    );
}
