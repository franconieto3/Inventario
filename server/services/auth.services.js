import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (dni, password) => {
    // 1. Buscar usuario
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('dni', dni)
      .maybeSingle();

    if (error) throw new Error("Error de BD");
    if (!user) throw new Error("Credenciales inválidas");

    // 2. Comparar password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error("Credenciales inválidas");

    // 3. Generar token
    const token = jwt.sign(
      { id: user.id_usuario, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '9h' }
    );

    return { token, user };
};

export const registerUser = async (dni, password, name, email, telefono)=>{
    
    //1. Validar si existe el usuario

    const { data: existingUser, error: searchError } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .or(`dni.eq.${dni},email.eq.${email}`)
      .maybeSingle();
     

    if (existingUser) throw new Error("El usuario con este DNI o Email ya existe.");
    if (searchError) throw new Error ("Error al verificar usuario");
    
    //Encriptar la contraseña (Hashing)

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //Insertar en supabase

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

    if (error) throw new Error ("Error al insertar en la base de datos" );

    return data;
}