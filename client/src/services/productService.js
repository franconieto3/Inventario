export const createProductAPI = async (productPayload, token) => {
  try {
    const response = await fetch('http://localhost:4000/productos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // IMPORTANTE: El backend espera "Bearer <token>"
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(productPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      // Si el servidor devuelve 400, 401, 500, lanzamos error
      throw new Error(data.error || 'Error al crear el producto');
    }

    return data; // Retorna { message: "...", id_producto: ... }

  } catch (error) {
    console.error("Error en la petición:", error);
    throw error;
  }
};