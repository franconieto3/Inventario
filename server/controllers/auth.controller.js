import * as authService from "../services/auth.services.js";

export const login = async (req, res) => {
  try {
    const { dni, password } = req.body;

    if (!dni || !password) {
      return res.status(400).json({ error: "DNI y contraseña obligatorios" });
    }

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

    // 2. Validar si el usuario ya existe (por DNI o Email)
    // Esto evita errores de SQL y permite dar un mensaje más amigable

    const { data: existingUser, error: searchError } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .or(`dni.eq.${dni},email.eq.${email}`)
        .maybeSingle();
        

    if (existingUser) {
        return res.status(409).json({ error: "El usuario con este DNI o Email ya existe." });
    }

    // 3. Encriptar la contraseña (Hashing)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Insertar en Supabase
    // NOTA: Mapeamos las variables del frontend a las columnas de la IMAGEN de la BD.
    const { data, error } = await supabase
        .from('usuarios') // Nombre exacto de la tabla en la imagen
        .insert([
        {
            dni: parseInt(dni),    // La imagen dice que dni es 'int'
            password: hashedPassword, // Columna 'contraseña', guardamos el hash
            name: name,          // Columna 'nombre'
            email: email,          // Columna 'email'
            telefono: telefono     // Columna 'telefono'
        }
        ])
        .select(); // .select() devuelve el registro creado

    if (error) {
        console.error("Error de Supabase:", error);
        return res.status(500).json({ error: "Error al insertar en la base de datos" });
    }

    /*
    const data = await authService.registerUser(dni, password, name, email, telefono);
    */

    // 5. Respuesta exitosa
    res.status(201).json({ 
        message: "Usuario registrado con éxito", 
        user: data[0] 
    });

    } catch (err) {
    console.error("Error del servidor:", err);
    res.status(500).json({ error: "Error interno del servidor" });
    }
}