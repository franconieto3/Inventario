import {z} from 'zod';

export const loginSchema = z.object({
    dni: z.string().min(1, "Datos incompletos. Ingrese su DNI").regex(/^\d+$/, "El DNI solo debe contener números"),
    password: z.string().min(1, "Datos incompletos. Ingrese su contraseña")
});

export const registerSchema = z.object({
    dni: z.string().min(1, "El DNI es obligatorio").regex(/^\d+$/, "El DNI solo debe contener números"),
    password: z.string().min(1, "La contraseña es obligatoria"),
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().min(1,"El e-mail es obligatorio").email("Ingrese un e-mail válido"),
    telefono: z.string().regex(/^\d+$/, "El teléfono solo debe contener números").optional()
})

export const passwordResetSchema = z.object({    
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});