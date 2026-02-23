import React from "react";
import "./Table.css";

export default function Table({ data = [], columns = [] }) {
  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="custom-table">
            
          {/*Encabezado*/}
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="table-header">
                  {col.header || col.key}
                </th>
              ))}
            </tr>
          </thead>

          {/*Body*/}
          
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="table-row">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="table-cell">
                      {/* Si la columna tiene una función render, la usa, sino muestra el valor de la key */}
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="table-empty">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}