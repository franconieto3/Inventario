import React, { useState } from "react";
import { DropdownMenu } from "../../../components/ui/DropdownMenu"; // Importa tu componente
import { apiCall } from "../../../services/api";
import { UserAuth } from "../../auth/context/AuthContext";
import Can from "../../../components/Can";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function ChangeRequestRowActions({ row, onUpdate }) {

  const {user} = UserAuth();

  const [isOpen, setIsOpen] = useState(false);

  const actualizarSolicitud = async(idEstado)=>{
    try{
      const res = await apiCall(`${API_URL}/api/documentos/actualizacion-solicitud`,{
          method:'POST',
          body:JSON.stringify({
            idSolicitud: row.id_solicitud_cambio,
            idUsuario: user.id_usuario,
            idEstado: idEstado
          })
        });

      onUpdate();

    }catch(err){
      console.log(err.message);
      alert(err.message);
    }
  }

  const menuItems = [
    { 
      label: 'Realizado', 
      icon: 'check', 
      onClick: () => actualizarSolicitud(2) 
    },
    { separator: true },
    { 
      label: 'Rechazar', 
      icon: 'close', 
      color: '#ef4444', 
      onClick: () => actualizarSolicitud(3)  
    }
  ]

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Can permission='modificar_solicitud_cambio'>
        <DropdownMenu 
          isOpen={isOpen} 
          onToggle={() => setIsOpen(!isOpen)} 
          items={menuItems} 
        />
      </Can>
    </div>
  );
}