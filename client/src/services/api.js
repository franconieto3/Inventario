const getToken = ()=> localStorage.getItem('token');

export const apiCall = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        ...(!options.body || typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
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

    // 2. NUEVO: Lógica para parsear la respuesta dependiendo de lo esperado o del Content-Type
    if (options.responseType === 'blob' || (contentType && (contentType.includes("application/pdf") || contentType.includes("application/octet-stream")))) {
        // Si pedimos explícitamente un blob, o el servidor devuelve un archivo
        // Pero ojo: si hay un error (ej. 404), el servidor suele devolver JSON, no un archivo
        if (!response.ok && contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.blob();
        }
    } else if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }
  
    if (!response.ok) {
            let errorMessage = "";
            if (data instanceof Blob) {
                errorMessage = "Error al descargar el archivo";
            } else if(typeof data === 'object'){
                if(data.message) errorMessage = data.message;
                if(data.error) errorMessage = data.error;
            } else if(typeof data === 'string'){
                errorMessage = data;
            }else{
                errorMessage = "Error en la petición";
            }
            const err = new Error(errorMessage);
            err.status = response.status;
            throw err;
        }

    return data;
};
