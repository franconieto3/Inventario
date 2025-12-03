import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem('token');
      
      // Llamamos al endpoint dinámico pasando el ID capturado
      const response = await fetch(`http://localhost:4000/productos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducto(data);
      }
    };

    fetchProduct();
  }, [id]); // El efecto se ejecuta si cambia el ID

  if (!producto) return <div>Cargando...</div>;

  return (
    <div>
      <h1>{producto.nombre}</h1>
      <p>Registro PM: {producto.id_registro_pm}</p>
      
      <h3>Piezas:</h3>
      <ul>
        {producto.pieza && producto.pieza.map(p => (
          <li key={p.id_pieza}>
             {p.nombre} - Código: {p.codigo_am}
          </li>
        ))}
      </ul>
    </div>
  );
}