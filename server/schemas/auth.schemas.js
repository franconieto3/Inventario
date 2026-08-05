import {z} from 'zod';

export const loginSchema = z.object({
    dni: z.string().min(1, "Datos incompletos. Ingrese su DNI").regex(/^\d+$/, "El DNI solo debe contener números"),
    password: z.string().min(1, "Datos incompletos. Ingrese su contraseña")
});

export const registerSchema = z.object({
    dni: z.string().min(1, "El DNI es obligatorio").regex(/^\d+$/, "El DNI solo debe contener números"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Debe ser un formato de correo válido").nullable().optional(),
    telefono: z.string().regex(/^\d+$/, "El teléfono solo debe contener números").nullable().optional()
})

export const passwordResetSchema = z.object({    
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string({
      required_error: "La contraseña actual es requerida",
      invalid_type_error: "La contraseña actual debe ser un texto",
    })
    .min(1, {
      message: "La contraseña actual no puede estar vacía",
    }),
    
  newPassword: z
    .string({
      required_error: "La nueva contraseña es requerida",
      invalid_type_error: "La nueva contraseña debe ser un texto",
    })
    .min(6, {
      message: "La nueva contraseña debe tener al menos 6 caracteres",
    })
});