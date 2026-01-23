const getToken = ()=> localStorage.getItem('token');

export const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(endpoint, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Aquí puedes despachar un evento o llamar a una función de logout global
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new Error('Sesión expirada');
    }

    // 1. Verificamos el tipo de contenido que respondió el servidor
    const contentType = response.headers.get("content-type");

    let data;

    if (contentType && contentType.includes("application/json")) {
        // Si es JSON, lo parseamos como tal
        data = await response.json();
    } else {
        // Si es texto plano (o HTML/XML), lo leemos como texto para que no rompa
        data = await response.text();
    }

    if (!response.ok) {
            // Si el servidor mandó un error en JSON, usamos su mensaje. Si no, el texto genérico.
            // A veces 'data' será un objeto {message: "error"}, a veces un string "Error".
            console.log(data);
            const errorMessage = (typeof data === 'object' && data.message) 
                ? data.message 
                : (typeof data === 'string' ? data : 'Error en la petición');
                
            throw new Error(errorMessage);
        }

    return data;
};