const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getToken = ()=> localStorage.getItem('token');

export const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Aquí puedes despachar un evento o llamar a una función de logout global
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new Error('Sesión expirada');
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la petición');
    }

    return response.json();
};