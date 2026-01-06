// server/index.js
/*
import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";*/

import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/auth.routes.js";

import { z } from 'zod';

import { supabase, supabaseAdmin } from "./config/supabase.js";
import { verificarToken } from "./middlewares/auth.middleware.js";


// Middlewares
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.get('/verificar', verificarToken, (req, res)=>{
  //res.sendStatus(200)
  return res.status(200).json(req.usuario);});

/*
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
      { id: user.id_usuario, email: user.email }, 
      process.env.JWT_SECRET, // En producción, usa variables de entorno
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
});*/

app.use("/auth", authRoutes);

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

// Obtener Rubros
app.get('/rubros', verificarToken, async (req, res) => {
  try {
    
    const { data, error } = await supabase
      .from('rubro')
      .select('id_rubro, descripcion'); 

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener rubros" });
  }
});

// Obtener Registros PM
app.get('/registros-pm', verificarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('registro_pm')
      .select('id_registro_pm, descripcion');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener registros PM" });
  }
});

//Obtener productos
app.get('/productos', verificarToken, async (req, res)=>{
  try{
    const {data, error} = await supabase.from('producto').select('*');
    if (error) throw error;
    res.json(data);

  }catch(err){
    console.error(err);
    res.status(500).json({error:"Error al obtener productos"});
  }
})

// Ruta para crear Producto + Piezas (Transaccional)
app.post('/productos', verificarToken, async (req, res) => {
  try {
    const { nombre, id_registro_pm, id_rubro, piezas } = req.body;

    // Validaciones básicas de entrada
    if (!nombre || !piezas || piezas.length === 0) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Llamada a la función RPC de Supabase
    const { data, error } = await supabase.rpc('crear_producto_con_piezas', {
      nombre_prod: nombre,
      id_pm: id_registro_pm,
      id_rubro_param: id_rubro,
      piezas_json: piezas 
    });

    if (error) {
      console.error("Error en transacción:", error);
      // Supabase devuelve error 500 o 400 dentro del objeto error
      return res.status(500).json({ error: "Error al guardar el producto en la base de datos." });
    }

    // Si todo salió bien
    res.status(201).json({ 
      message: "Producto y piezas creados exitosamente", 
      id_producto: data.id_producto,
      id_registro_pm: data.id_registro_pm,
      id_rubro: data.id_rubro,
      nombre: data.nombre 
    });

  } catch (err) {
    console.error("Error del servidor:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// Ruta para obtener el detalle de UN producto específico por su ID
app.get('/productos/:id', verificarToken, async (req, res) => {
  try {
    // 1. Capturamos el ID que viene en la URL (ej: /productos/15 -> id = 15)
    const { id } = req.params;

    // Ejecutamos ambas consultas en paralelo para mejorar el rendimiento
    const [productoRes, documentosRes] = await Promise.all([
      supabase
        .from('producto')
        .select(`
          *,
          pieza (*) 
        `)
        .eq('id_producto', id)
        .single(),
      
      // Llamada a tu función personalizada de SQL
      supabase.rpc('obtener_ultima_version_por_documento', {
        p_id_producto: id
      })
    ]);

    // Manejo de errores de la consulta de producto
    if (productoRes.error) {
      if (productoRes.error.code === 'PGRST116') {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      throw productoRes.error;
    }

    // Manejo de errores de la función RPC (opcional, podrías devolver [] si falla)
    if (documentosRes.error) {
      console.error("Error al obtener documentos:", documentosRes.error);
      // No bloqueamos la respuesta si solo fallan los documentos
    }

    // Combinamos los datos
    const respuestaFinal = {
      ...productoRes.data,
      planos: documentosRes.data || []
    };
    console.log(respuestaFinal);
    res.json(respuestaFinal);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el detalle del producto" });
  }
});

app.post('/subir-plano', verificarToken, async (req,res)=>{
  const {fileName} = req.body;

  //Validaciones
  //¿El usuario puede subir planos?
  //¿El archivo cumple con el tipo y tamaño permitidos?
  //Validar piezas 

  const path = `planos/${Date.now()}-${fileName}`;
  
  const {data,error} = await supabaseAdmin
                            .storage
                            .from('planos')
                            .createSignedUploadUrl(path, { upsert: false });

  if (error) {
    console.error("Error Supabase Storage:", error);
    return res.status(500).json({ error: "No se pudo generar la URL de subida" });
  }
                            
  return res.json({ signedUrl: data.signedUrl, uploadToken: data.token, path: path });
  }
);

const DocumentoPayloadSchema = z.object({
  documento: z.object({
    id_tipo_documento: z.number().int().positive({ message: "ID de tipo inválido" }),
    descripcion: z.string().min(3, { message: "La denominación es muy corta" }),
    id_producto: z.number().int().positive({ message: "ID de producto inválido" })
  }),
  version: z.object({
    n_version: z.number().int().nonnegative(),
    fecha_vigencia: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Formato de fecha inválido (Use ISO 8601)"
    }),
    commit: z.string().optional(),
    //resolucion: z.string().optional(),
    path: z.string().min(1, { message: "El path del archivo es obligatorio" })
  }),
  piezas: z.array(z.number().int()).optional().default([])
});

app.post('/guardar-documento', verificarToken, async (req, res)=>{
  try{
    const datosValidado = DocumentoPayloadSchema.parse(req.body);

    // Intentamos obtener los metadatos del archivo para ver si existe
    const BUCKET_NAME = 'planos';
    const filePath = datosValidado.version.path;

    const { data: fileData, error: fileError } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .list(filePath.split('/').slice(0, -1).join('/'), { // Listamos la carpeta contenedora
        limit: 100,
        search: filePath.split('/').pop() // Buscamos el nombre exacto del archivo
    });

    if (fileError || !fileData || fileData.length === 0) {
      return res.status(400).json({ 
        error: "Validación de Archivo Fallida", 
        message: `El archivo '${filePath}' no fue encontrado en el bucket '${BUCKET_NAME}'. Súbelo primero.` 
      });
    }

    // Ejecutar la Función SQL (RPC)
    
    const { data: idVersionCreada, error: rpcError } = await supabase
      .rpc('crear_documento_version_piezas', { 
        payload: datosValidado 
      });

    if (rpcError) {
      // Manejamos errores específicos de SQL
      console.error("❌ Error SQL:", rpcError);
      
      // Si es el error que lanzamos manualmente en SQL o constraint unique
      if (rpcError.code === 'P0001' || rpcError.code === '23505') { 
         return res.status(409).json({ error: "Conflicto", message: rpcError.message });
      }
      
      return res.status(500).json({ error: "Error de Base de Datos", details: rpcError.message });
    }

    // ÉXITO
    return res.status(201).json({
      message: "Documento y versión creados exitosamente",
      id_version: idVersionCreada
    });

  }catch(error){
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        detalles: error.errors.map(e => ({ campo: e.path.join('.'), mensaje: e.message })) 
      });
    }

    // Captura de otros errores no controlados
    console.error("❌ Error del servidor:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
})

app.post('/obtener-url-plano', verificarToken, async (req, res) => {
  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({ error: "El path del archivo es obligatorio" });
    }

    // Usamos supabaseAdmin para saltarnos las RLS y firmar el archivo
    // Expira en 60 segundos. El usuario solo necesita el link para iniciar la carga en el navegador.
    const { data, error } = await supabaseAdmin
      .storage
      .from('planos')
      .createSignedUrl(path, 60); 

    if (error) {
      console.error("Error firmando URL:", error);
      return res.status(500).json({ error: "No se pudo obtener el documento" });
    }

    res.json({ signedUrl: data.signedUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
