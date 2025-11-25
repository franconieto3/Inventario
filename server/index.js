// server/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

// Middlewares
const app = express();
app.use(cors());
app.use(express.json());

// Middleware para verificar el token
const verificarToken = (req, res, next) => {
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
    res.status(400).json({ error: "Token inválido o expirado." });
  }
};

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

//Ruta de Login
app.post('/login', async (req, res) => {
  try {
    const { dni, password } = req.body;

    // 1. Validar que lleguen los datos
    if (!dni || !password) {
      return res.status(400).json({ error: "DNI y contraseña son obligatorios" });
    }

    // 2. Buscar el usuario en Supabase por DNI
    // Seleccionamos todos los campos (*) para poder chequear la contraseña y devolver los datos
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('dni', dni)
      .maybeSingle(); // maybeSingle retorna null si no encuentra nada, en vez de error

    if (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al conectar con la base de datos" });
    }

    // Si no existe el usuario
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" }); 
      // Nota: Por seguridad, es mejor decir "Credenciales inválidas" que "Usuario no encontrado"
    }

    // 3. Comparar la contraseña (bcrypt)
    // user.contraseña es el hash que guardamos en el registro
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 4. Generar un Token (JWT)
    // Esto crea una "llave" digital que contiene el ID del usuario y expira en 1 hora
    const token = jwt.sign(
      { id: user.id_suario, email: user.email }, 
      process.env.JWT_SECRET || 'secreto_super_seguro', // En producción, usa variables de entorno
      { expiresIn: '9h' }
    );

    // 5. Responder al frontend
    res.json({
      message: "Login exitoso",
      token: token,
      user: {
        id: user.id_usuario,
        name: user.name,
        email: user.email,
        dni: user.dni
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta de Registro
app.post('/register', async (req, res) => {
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

    // 5. Respuesta exitosa
    res.status(201).json({ 
      message: "Usuario registrado con éxito", 
      user: data[0] 
    });

  } catch (err) {
    console.error("Error del servidor:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta protegida: Obtener datos del perfil
app.get('/perfil', verificarToken, async (req, res) => {
  try {
    // Gracias al middleware, ahora tenemos acceso a req.usuario.id
    const userId = req.usuario.id;

    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, dni, nombre, email, telefono') // No traemos la contraseña
      .eq('id_usuario', userId)
      .single();

    if (error) throw error;

    res.json({ 
      message: "Acceso autorizado", 
      datos: data 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});


const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
