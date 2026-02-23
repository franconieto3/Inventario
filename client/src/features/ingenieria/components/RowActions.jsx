import React, { useState } from "react";
import { DropdownMenu } from "../../../components/ui/DropdownMenu"; // Importa tu componente

export function ChangeRequestRowActions({ row , menuItems}) {
  const [isOpen, setIsOpen] = useState(false);


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