import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const searchUser = async(dni)=>{
    const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('dni', dni)
    .maybeSingle();

    if(error){
      const err = new Error("No se pudo encontrar el usuario solicitado");
      err.statusCode = 500;
      throw err;
    }

    if(!user){
      const err = new Error("Credenciales inválidas");
      err.statusCode = 400
      throw err;
    }

    return user;
}

export const comparePassword = async(password, refPassword)=>{
    const passwordMatch = await bcrypt.compare(password, refPassword);

    if (!passwordMatch){ 
      const err =  new Error("Contraseña incorrecta");
      err.statusCode = 400;
      throw err;
    }

    return true;
}

export const getUserById = async(id)=>{

  const {data, error} = await supabase.rpc('obtener_datos_usuario_json',{p_id_usuario: id});

  if(error){
    console.log(error);
    const err = new Error("Error verificando el usuario");
    err.statusCode = 500;
    throw err;
  }

  return data;
}

export const generateToken = (user)=>{
    const token = jwt.sign(
      user, 
      process.env.JWT_SECRET, 
      { expiresIn: '9h' }
    );

    return token;
}

export const registerUser = async (dni, password, name, email, telefono)=>{
    
    //1. Validar si existe el usuario

    const { data: existingUser, error: searchError } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .or(`dni.eq.${dni},email.eq.${email}`)
      .maybeSingle();
     

    if (existingUser) {
      const err = new Error("El usuario con este DNI o Email ya existe.");
      err.statusCode = 409;
      throw err;
    };

    if (searchError){
      const err = new Error("Error al verificar usuario");
      err.statusCode = 500;
      throw err;
    };
    
    //Encriptar la contraseña (Hashing)
    const hashedPassword = await hashPassword(password);

    //Insertar en supabase

    const { data, error } = await supabase
      .from('usuarios') 
      .insert([
        {
          dni: parseInt(dni), 
          password: hashedPassword, 
          name: name,          
          email: email,          
          telefono: telefono     
        }
      ])
      .select(); 

    if (error){ 
      const err = new Error("Error al insertar en la base de datos");
      err.statusCode = 500;
      throw err;
    }

    return data;
}

export const changePassword = async (id_usuario, password) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ password: password })
    .eq('id_usuario', id_usuario)
    .select();
  
  // 1. Manejo de errores de formato o base de datos (Supabase sí devuelve 'error')
  if (error) {
    const err = new Error("Error al cambiar la contraseña");
    // '22P02' es el código de Postgres para sintaxis de entrada inválida (ej. UUID mal formado)
    // '23514' es el código para violación de constraint (ej. si la contraseña es muy corta según la BD)
    if (error.code === '22P02' || error.code === '23514') {
      err.message = "Formato de datos no válido";
      err.statusCode = 400; // Bad Request
    } else {
      err.statusCode = 500; // Internal Server Error
      console.error("Error interno de Supabase:", error);
    }
    throw err;
  }
  // 2. Manejo de usuario no encontrado
  if (!data || data.length === 0) {
    const err = new Error("Usuario no encontrado");
    err.statusCode = 404; // Not Found
    throw err;
  }

  return data[0]; 
}

export const hashPassword = async (password)=>{
  const saltRounds = 10;
  return await bcrypt.hash(password, 10);
}