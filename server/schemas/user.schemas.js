// schemas/user.schema.js
import { z } from "zod";

// --- Validadores Auxiliares ---
// Valida que el ID proveniente de los params sea numérico
export const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/, "El parámetro ID debe ser un número entero válido")
});


// --- Esquemas de Usuarios ---

export const editarUsuarioSchema = z.object({
        nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
        email: z.string().email("Debe ser un formato de correo válido").optional(),
        telefono: z.string().optional()
    })

export const bajaUsuarioSchema = z.object({
        usuario: z.object({
            roles: z.array(z.object({
                nivel: z.number({ required_error: "El nivel del rol es requerido" })
            }).passthrough()).optional()
        }, { required_error: "El objeto 'usuario' es requerido en el body" }).passthrough()
    });


// --- Esquemas de Roles ---

export const crearRolSchema = z.object({
        nombre: z.string({ required_error: "El nombre es requerido" })
            .min(2, "El nombre debe tener al menos 2 caracteres"),
        nivel: z.number({ required_error: "El nivel es requerido" })
            .int()
            .positive("El nivel debe ser un número positivo"),
        permisos: z.array(z.number().int(), { 
            invalid_type_error: "Los permisos deben ser un arreglo de IDs (números enteros)" 
        }).default([]) // Si no envían permisos, por defecto es un array vacío
    });

export const editarRolSchema = z.object({
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
        nivel: z.number().int().positive().optional(),
        permisosAgregados: z.array(z.number().int()).default([]),
        permisosQuitados: z.array(z.number().int()).default([])
    });

// --- Esquemas de Asignaciones ---

export const administrarRolesSchema = z.object({
        id_usuario: z.number({ required_error: "El id_usuario es requerido" }).int().positive(),
        // Esperamos objetos porque el controlador verifica `rol.nivel`
        rolesAgregados: z.array(z.object({
            id_rol: z.number().int(),
            nivel: z.number()
        }).passthrough()).default([]),
        rolesQuitados: z.array(z.object({
            id_rol: z.number().int(),
            nivel: z.number()
        }).passthrough()).default([])
    });

export const administrarSectoresSchema = z.object({
        id_usuario: z.number({ required_error: "El id_usuario es requerido" }).int().positive(),
        sectoresAgregados: z.array(z.number().int()).default([]),
        sectoresQuitados: z.array(z.number().int()).default([])
    });