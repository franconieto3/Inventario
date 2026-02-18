import * as authService from "../services/auth.services.js";

export const login = async (req, res) => {
  try {
    const { dni, password } = req.body;

    // Llamamos al servicio (Lógica pura)
    const result = await authService.loginUser(dni, password);

    // Respondemos (HTTP)
    res.json({
      message: "Login exitoso",
      token: result.token,
      user: {
        id: result.user.id_usuario,
        name: result.user.name,
        email: result.user.email,
        dni: result.user.dni
      }
    });

  } catch (err) {
    console.error(err);
    // Manejo básico de errores según el mensaje
    if (err.message === "Credenciales inválidas") {
        return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const register = async (req, res)=>{
    try {
      // 1. Desestructurar los datos que vienen del frontend (Register.jsx)
      const { dni, password, name, email, telefono } = req.body;

      // Validación básica del lado del servidor (opcional, pero recomendada como doble chequeo)
      if (!dni || !password || !name || !email) {
          return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const data = await authService.registerUser(dni, password, name, email, telefono);

      //Respuesta exitosa
      res.status(201).json({ 
          message: "Usuario registrado con éxito", 
          user: data[0] 
      });

    } catch (err) {
      if(err.message==="El usuario con este DNI o Email ya existe."){
        res.status(409).json({error: err.message});
      }
      console.error("Error del servidor:", err);
      res.status(500).json({ error: err.message });
    }
}

export const verificar = async (req, res)=>{
  try{
  const userId = req.usuario.id;

  const userFound = await authService.getUserById(userId);

  if(!userFound) return res.status(401).json({message:"Usuario no encontrado"})
   
  return res.status(200).json({user: userFound}); 

  //return res.status(200).json({user: req.usuario});

  }catch(err){
    console.error(err);
    return res.status(500).json({error: "Error al verificar usuario"});
  }
}

export const perfil = async (req, res)=>{
  try{
    const userId = req.usuario.id;

    const data = await authService.obtenerPerfil(userId);

    res.status(201).json({
      message: "Acceso autorizado", 
      datos: data 
    });
    
  }catch(err){
    console.error(err);
    res.status(err.statusCode? err.statusCode : 500).json({error: err.message? err.message: "Error al obtener perfil"})
  }
}