// server/index.js
/*
import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";*/

import express from "express";
import cors from "cors";
//import bcrypt from "bcrypt";
//import jwt from "jsonwebtoken";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js"
import documentRoutes from "./routes/document.routes.js";



import { supabase, supabaseAdmin } from "./config/supabase.js";
import { verificarToken } from "./middlewares/auth.middleware.js";


// Middlewares
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});


app.use("/auth", authRoutes);

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


app.use("/api/productos", productRoutes);
app.use('/api/documentos', documentRoutes);


const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
