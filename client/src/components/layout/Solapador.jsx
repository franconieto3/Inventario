import React, { useState } from 'react';
import './Solapador.css';

const Solapador = ({ children }) => {
  const [solapaActiva, setSolapaActiva] = useState(0);

  // Filtramos los hijos para asegurarnos de que solo procesamos elementos React válidos
  const hijosValidos = React.Children.toArray(children).filter(
    React.isValidElement
  );

  return (
    <div className="solapador-contenedor">
      {/* Menú de Solapas */}
      <div className="solapador-cabecera">
        {hijosValidos.map((hijo, index) => (
          <button
            key={index}
            className={`solapador-boton ${solapaActiva === index ? 'activo' : ''}`}
            onClick={() => setSolapaActiva(index)}
          >
            {hijo.props.titulo || `Solapa ${index + 1}`}
          </button>
        ))}
      </div>

      {/* Contenido de la Solapa Activa */}
      <div className="solapador-contenido">
        {hijosValidos[solapaActiva]}
      </div>
    </div>
  );
};

export default Solapador;