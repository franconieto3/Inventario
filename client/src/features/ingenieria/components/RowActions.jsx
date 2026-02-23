import React, { useState } from "react";
import { DropdownMenu } from "../../../components/ui/DropdownMenu"; // Importa tu componente

export function ChangeRequestRowActions({ row }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      label: 'Realizado', 
      icon: 'check', 
      onClick: () => console.log('Editando:', row) 
    },
    { separator: true },
    { 
      label: 'Rechazar', 
      icon: 'close', 
      color: '#ef4444', 
      onClick: () => console.log('Eliminando:', row) 
    }
  ]

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <DropdownMenu 
        isOpen={isOpen} 
        onToggle={() => setIsOpen(!isOpen)} 
        items={menuItems} 
      />
    </div>
  );
}