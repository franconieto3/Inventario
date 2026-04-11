import React from 'react';
import './Spinner.css';

export const Spinner = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '',
  center = false, 
  label = ''
}) => {
  return (
    <div 
      className={`ui-spinner-container ${center ? 'ui-spinner-center' : ''} ${className}`}
      role="status" 
      aria-label="Cargando"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ui-spinner"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>

      {label && (
        <span className="ui-spinner-label ui-spinner-label-pulse">
          {label}
        </span>
      )}

    </div>
  );
};