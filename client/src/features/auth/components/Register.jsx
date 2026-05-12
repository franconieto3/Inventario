// client/src/components/auth/Register.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../services/api';
import NavBar from '../../../components/layout/NavBar';
import Button from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { NewUser } from './NewUser';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Register() {

  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  return (
    <>
      <NavBar/>

      <div className='body-container'>
        <Button variant='default' onClick={()=>setMostrarRegistro(true)}>
          Agregar nuevo usuario
        </Button>

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