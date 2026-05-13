import { useState, useCallback } from 'react';
import { apiCall } from '../../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useUsers = () => {
    // --- ESTADOS DE DATOS ---
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permisos, setPermisos] = useState([]);
    
    // --- ESTADOS DE CARGA Y ERROR ---
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- CONTROLES DE PAGINACIÓN: USUARIOS ---
    const [usuariosPage, setUsuariosPage] = useState(1);
    const [usuariosLimit, setUsuariosLimit] = useState(10);

    // --- CONTROLES DE PAGINACIÓN: ROLES ---
    const [rolesPage, setRolesPage] = useState(1);
    const [rolesLimit, setRolesLimit] = useState(10);

    // --- FUNCIONES DE FETCH ---

    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiCall(`${API_URL}/api/usuarios/listado`);
            setUsuarios(response?.data?.data || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Error al obtener la lista de usuarios');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiCall(`${API_URL}/api/usuarios/roles/listado`);
            setRoles(response?.data?.data || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Error al obtener la lista de roles');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPermisos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiCall(`${API_URL}/api/usuarios/permisos/listado`);
            setPermisos(response?.data?.data || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Error al obtener la lista de permisos');
        } finally {
            setLoading(false);
        }
    }, []);

    // Función auxiliar para cargar todo de una vez si es necesario
    const fetchAll = useCallback(() => {
        fetchUsuarios();
        fetchRoles();
        fetchPermisos();
    }, [fetchUsuarios, fetchRoles, fetchPermisos]);

    // --- CÁLCULO DE DATOS PAGINADOS (Client-side) ---

    const paginatedUsuarios = usuarios.slice(
        (usuariosPage - 1) * usuariosLimit,
        usuariosPage * usuariosLimit
    );

    const paginatedRoles = roles.slice(
        (rolesPage - 1) * rolesLimit,
        rolesPage * rolesLimit
    );

    // --- METADATOS DE PAGINACIÓN ---
    const usuariosTotalPages = Math.ceil(usuarios.length / usuariosLimit);
    const rolesTotalPages = Math.ceil(roles.length / rolesLimit);

    return {
        // Datos crudos y paginados
        usuarios: paginatedUsuarios,
        totalUsuarios: usuarios.length,
        roles: paginatedRoles,
        totalRoles: roles.length,
        permisos, // Los permisos no tienen paginación por requerimiento
        
        // Estados HTTP
        loading,
        error,

        // Paginación Usuarios
        usuariosPage,
        setUsuariosPage,
        usuariosLimit,
        setUsuariosLimit,
        usuariosTotalPages,

        // Paginación Roles
        rolesPage,
        setRolesPage,
        rolesLimit,
        setRolesLimit,
        rolesTotalPages,

        // Métodos de carga
        fetchUsuarios,
        fetchRoles,
        fetchPermisos,
        fetchAll
    };
};