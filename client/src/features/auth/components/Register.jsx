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
import { AdministrarRoles } from './AdministrarRoles';
import { AdministrarSectores } from './AdministrarSectores';
import { useSectores } from '../../sectores/hooks/useSectores';
import { UserAuth } from '../context/AuthContext';
import { maximoNivelRoles } from '../services/MaximoNivel';
import { EditarUsuario } from './EditarUsuario';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Register() {

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [mostrarEditarUsuario, setMostrarEditarUsuario] = useState(false);
  const [mostrarAdministrarRoles, setMostrarAdministrarRoles] = useState(false);
  const [mostrarAdministrarSectores, setMostrarAdministrarSectores] = useState(false);

  const {usuarios, roles, permisos, fetchUsuarios, fetchRoles, fetchPermisos, fetchAll} = useUsers();
  const {sectores} = useSectores();
  const {user} = UserAuth();

  useEffect(()=>{
    fetchAll();
  },[fetchAll]);

  const handleDelete = async (usuario)=>{
    //Un usuario no se puede dar de baja a sí mismo
    if (user.id_usuario === usuario.id_usuario || user.email === usuario.email){
      alert("No es posible darse de baja a uno mismo");
      return;
    }

    //Un usuario no puede dar de baja a usuarios con roles de mayor jerarquía?
    if (maximoNivelRoles(user.roles)>maximoNivelRoles(usuario.roles)){
      alert("No tienes la jerarquía para dar de baja al usuario seleccionado");
      return;
    }
    
    if(window.confirm(`¿Desea dar de baja a ${usuario.name}?:`)){
      try{

        const res = await apiCall(`${API_URL}/api/usuarios/baja/${usuario.id_usuario}`,{
          method: 'PUT',
          body: JSON.stringify({
            usuario: usuario
          })
        })

        console.log('Usuario dado de baja');
        setUsuarioSeleccionado(null);
        fetchUsuarios();

      }catch(error){
        alert(error.message);
        setUsuarioSeleccionado(null);
      }
    }
  }

  return (
    <>
      <NavBar/>

      <div className='body-container'>
      <Solapador>
        <div titulo="Usuarios">
          <ListadoUsuarios 
            usuarios={usuarios} 
            onEditUser={(usuario)=>{
              setUsuarioSeleccionado(usuario);
              setMostrarEditarUsuario(true);
            }}
            onEditRoles={(usuario)=>{
              setUsuarioSeleccionado(usuario);
              setMostrarAdministrarRoles(true);
            }}
            onEditSectores={(usuario)=>{
              setUsuarioSeleccionado(usuario);
              setMostrarAdministrarSectores(true);
            }}
            Open={()=>setMostrarRegistro(true)}
            onDelete={(usuario)=>handleDelete(usuario)}
            />
            
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
        {mostrarEditarUsuario &&
          <Modal
            titulo="Editar usuario"
            descripcion=""
            onClose={()=>setMostrarEditarUsuario(false)}
          >
            <EditarUsuario
              onClose={()=>{
                setMostrarEditarUsuario(false)
                setUsuarioSeleccionado(null);
              }}
              onSuccess={fetchUsuarios}
            />
          </Modal>
        }
        {
          mostrarAdministrarRoles && usuarioSeleccionado &&
          <Modal
            titulo="Administrar roles"
            descripcion={usuarioSeleccionado.name}
            onClose={()=>{
              setMostrarAdministrarRoles(false);
              setUsuarioSeleccionado(null);
            }}
          >
            <AdministrarRoles 
              roles={roles} 
              usuario={usuarioSeleccionado} 
              user={user}
              onSuccess={fetchUsuarios} 
              onClose={()=>{setMostrarAdministrarRoles(false); setUsuarioSeleccionado(null)}}></AdministrarRoles>
          </Modal>
        }
        {
          mostrarAdministrarSectores &&
          <Modal
            titulo="Administrar sectores"
            descripcion=""
            onClose={()=>{
              setMostrarAdministrarSectores(false);
              setUsuarioSeleccionado(null);
            }}
          >
            <AdministrarSectores 
              sectores={sectores} 
              usuario={usuarioSeleccionado} 
              user={user}
              onSuccess={fetchUsuarios} 
              onClose={()=>{
                setMostrarAdministrarSectores(false); 
                setUsuarioSeleccionado(null)
                }
              }
              />
          </Modal>
        }
      </div> 
    </>
  );
}