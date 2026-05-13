// client/src/components/auth/Register.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../services/api';
import NavBar from '../../../components/layout/NavBar';
import Button from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { NewUser } from './NewUser';
import { useUsers } from '../hooks/useUsers';
import { ListadoUsuarios } from './ListadoUsuarios';
import { ListadoRoles } from './ListadoRoles';
import Solapador from '../../../components/layout/Solapador';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Register() {

  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const {usuarios, roles, permisos, fetchUsuarios, fetchRoles, fetchPermisos, fetchAll} = useUsers();

  useEffect(()=>{
    fetchAll();
  },[fetchAll]);


  return (
    <>
      <NavBar/>
      <div className='body-container'>
      <Solapador>
        <div titulo="Usuarios">
          <ListadoUsuarios usuarios={usuarios} onOpen={()=>setMostrarRegistro(true)}/>
        </div>
        <div titulo="Roles">
          <ListadoRoles roles={roles} onOpen={()=>{}} />
        </div>
      </Solapador>
  
        {mostrarRegistro &&
          <Modal
            titulo="Registrar nuevo usuario"
            descripcion=""
            onClose={()=>setMostrarRegistro(false)}
          >
            <NewUser
              onClose={()=>setMostrarRegistro(false)}
              onSuccess={()=>setMostrarRegistro(false)}
            />
          </Modal>
        }
      </div> 
    </>
  );
}