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
     

    if (existingUser) throw new Error("El usuario con este DNI o Email ya existe.");
    if (searchError) throw new Error ("Error al verificar usuario");
    
    //Encriptar la contraseña (Hashing)

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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

    if (error) throw new Error ("Error al insertar en la base de datos" );

    return data;
}

