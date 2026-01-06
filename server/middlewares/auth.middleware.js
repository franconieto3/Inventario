import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  // 1. Obtener el token del encabezado (Header)
  // El formato estándar es: "Authorization: Bearer <token_aqui>"
  
  const authHeader = req.headers['authorization'];
  
  // Si no hay header, o no tiene el formato correcto, tomamos undefined
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
  }
  
  try {
    // 2. Verificar el token con la misma clave secreta del login
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Si es válido, guardamos los datos del usuario en la request
    // "verified" contiene lo que guardamos en el payload: { id, email }
    req.usuario = verified;
    
    // 4. Continuar con la siguiente función (la ruta protegida)
    next(); 
  } catch (error) {
      if (error.name === "TokenExpiredError") {
        console.log("El token expiró");
        res.status(400).json({ error: "Token expirado" });
      } else {
        console.log("Token inválido:", error.message);
        res.status(400).json({ error: "Token inválido" });
      }
    
  }
};