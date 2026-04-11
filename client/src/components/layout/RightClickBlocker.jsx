import React from 'react';
import './RightClickBlocker.css'

const RightClickBlocker = ({ children, className = "" }) => {
  const handleContextMenu = (e) => {
    // Desactiva el menú contextual
    e.preventDefault();
  };

  return (
    <div 
      onContextMenu={handleContextMenu} 
      className={`disable-select ${className}`}
      style={{ display: 'inline-block', width: '100%' }}
    >
      {children}
    </div>
  );
};

export default RightClickBlocker;