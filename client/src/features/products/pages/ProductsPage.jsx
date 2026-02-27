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
import { ListadoProductos } from "../components/ListadoProductos";

//Estilos
import "./ProductsPage.css"
import Button from "../../../components/ui/Button";


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ProductsPage(){
    const navigate = useNavigate(); 

    //Estados
    const { 
        productos, 
        rubros, 
        registrosPM, 
        loadingProducts, 
        loadingAux,
        page,
        setPage,
        totalPages,
        refreshProducts,
        handleSetRubro,
        handleSetRegistroPM
    } = useProducts();

    const [mostrarEdicion, setMostrarEdicion] = useState(false);
    const [showNewProduct, setShowNewProduct] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [idRubroSeleccionado, setIdRubroSeleccionado] = useState(null);
    const [idRegistroSeleccionado, setIdRegistroSeleccionado] = useState(null);

    const [reload, setReload] = useState(0);

    //Selección de productos


    //Edición de productos
    const abrirModalEdicion = (producto)=>{
        setProductoSeleccionado(producto)
        setMostrarEdicion(true);
    }

    const handleCloseModal =()=>{
        setMostrarEdicion(false);
        setProductoSeleccionado(null);
        setShowNewProduct(false);
    }
    //Refrescar la página una vez editado o eliminado un producto
    const handleSuccess = ()=>{
        handleCloseModal();
        refreshProducts();
    }

    //Eliminación de productos
    const handleEliminarProducto = async (producto)=>{
        if(window.confirm("¿Seguro que deseas eliminar este producto?")){
            try{
                const res = await apiCall(`${API_URL}/api/productos/eliminacion/${producto.id_producto}`, {'method':"DELETE"});
                console.log("Eliminando ", producto.nombre);
                handleSuccess();
                
            }catch(err){
                alert("No se pudo eliminar el producto seleccionado");
            }
        }
    }

    //Filtros
    const aplicarFiltros =()=>{
        handleSetRubro(idRubroSeleccionado);
        handleSetRegistroPM(idRegistroSeleccionado);
    }

    const limpiarFiltros=()=>{
        setIdRegistroSeleccionado(null);
        setIdRubroSeleccionado(null);
        handleSetRubro(null);
        handleSetRegistroPM(null);
        setReload(prev => prev + 1)
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
                            <Button variant="default" onClick={()=>setShowNewProduct(true)}>Agregar producto</Button>
                        </div>
                    </Can>
                    
                </div>
                <Can permission="acceso_repositorio">
                    <div style={{display:"flex", justifyContent:"space-between", gap:'10px',flexWrap:'wrap',marginBottom:'20px'}}>
                        <div style={{display:'flex', textAlign:'start',alignItems:'center', maxWidth:'500px'}}>
                            <div style={{minWidth:'300px'}}>
                                <h3 style={{fontWeight:'500'}}>Listado de productos</h3>
                                <p className="table-description">
                                    Repositorio de todos los productos, especificación de documentos, códigos, componenentes, materiales y procesos
                                </p>
                            </div>
                        </div>
                        <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap', justifyContent:'start'}}>
                            <div style={{minWidth:'250px'}}>
                                <Buscador 
                                    key={reload} 
                                    opciones={rubros}
                                    placeholder="Filtrar por rubros"
                                    keys={['id_rubro','descripcion']}
                                    onChange={(id) => setIdRubroSeleccionado(id)}
                                    idField='id_rubro'
                                    displayField='descripcion'
                                    showId={false}
                                    maxResults={rubros.length}
                                />
                            </div>
                            <div style={{minWidth:'250px'}}>
                                <Buscador 
                                    key={reload} 
                                    opciones={registrosPM}
                                    placeholder="Filtrar por P.M."
                                    keys={['id_registro_pm','descripcion']}
                                    onChange={(id) => setIdRegistroSeleccionado(id)}
                                    idField='id_registro_pm'
                                    displayField='descripcion'
                                    showId={false}
                                    maxResults={registrosPM.length}
                                />
                            </div>
                            <div style={{display:'flex',gap:'10px',paddingBottom:'10px'}}>
                                <Button variant="secondary" onClick={aplicarFiltros}>Aplicar filtros</Button>
                                <Button variant="ghost" onClick={limpiarFiltros}>Limpiar filtros</Button>
                            </div>
                        </div>
                    </div>
                    <ListadoProductos 
                        data={productos} 
                        onEdit={(prod) => abrirModalEdicion(prod)}
                        onDelete={(producto)=>handleEliminarProducto(producto)}
                    />
                </Can>
                
                {/* Controles de Paginación */}
                {totalPages > 1 && (
                    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems:'center', gap: '10px', marginTop: '20px' }}>
                        <button 
                            onClick={handlePrevPage} 
                            disabled={page === 1 || loadingProducts}
                            className="pagination-button" // Asegúrate de tener estilos o usa estilos inline
                        >
                            <i className="material-icons">chevron_left</i>
                        </button>
                        <span>{page} / {totalPages}</span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={page === totalPages || loadingProducts}
                            className="pagination-button"
                        >
                            <i className="material-icons">chevron_right</i>
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
