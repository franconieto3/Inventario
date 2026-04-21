import React, { useState } from "react";
import Table from "../../../components/ui/Table";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { useNavigate } from "react-router-dom";

export function ListadoInstrumentos({
    data,
    sectores,
    tiposInstrumento,
    params,
    onParamsChange,
    totalRecords,
    onEdit,
    onDelete
}) {
    const navigate = useNavigate();

    // Controla qué dropdown está abierto usando el ID del instrumento
    const [openDropdownId, setOpenDropdownId] = useState(null);

    // Cálculo de paginación
    const totalPages = Math.ceil(totalRecords / params.limit) || 1;

    // Manejador para los filtros (Selects)
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        // Al cambiar un filtro, volvemos siempre a la página 1
        onParamsChange({ ...params, [name]: value, page: 1 });
    };

    // Manejador para la paginación
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            onParamsChange({ ...params, page: newPage });
        }
    };

    // Definición de las columnas de la tabla
    const columns = [
        { 
            key: "descripcion", 
            header: "Descripción",
            render: (_,row)=> (
                <span 
                    onClick={()=>navigate(`/instrumento/${row.id_instrumento}`)}
                    style={{cursor:'pointer'}}
                >
                    {_}
                </span>
            )
        },
        {
            key: "nro_serie", 
            header: "N° de serie",
            render: (_, row)=> _? _ : 'Sin definir' 
        },
        {
            key: "marca", 
            header:"Marca",
            render: (_)=> _? _ : 'Sin definir'
        },
        {
            key: "modelo", 
            header: "Modelo",
            render: (_)=> _ ? _ : 'Sin definir'
        },
        {key: "tipo", header: "Tipo" },
        { 
            key: "sector", 
            header: "Sector",
            // Ajusta este render dependiendo de cómo venga estructurado el JSON de tu API
            render: (_, row) => row.sector?.descripcion || row.sector || 'Sin sector' 
        },
        {
            key: "estado",
            header: "Estado",
            render: (_, row) => {
                const estado = row.estado;
                
                // Estilo base minimalista (tipo 'pill' o 'badge')
                let badgeStyle = {
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.80rem',
                    fontWeight: '600',
                    display: 'inline-block',
                    border: '1px solid transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                };

                // Asignamos colores según el valor
                switch (estado) {
                    case 'Verificado':
                        badgeStyle = { ...badgeStyle, backgroundColor: '#e6f4ea', color: '#1e8e3e', borderColor: '#ceead6' };
                        break;
                    case 'Por caducar':
                        badgeStyle = { ...badgeStyle, backgroundColor: '#fff3e0', color: '#e65100', borderColor: '#ffe0b2' };
                        break;
                    case 'Caducado':
                        badgeStyle = { ...badgeStyle, backgroundColor: '#fce8e6', color: '#d93025', borderColor: '#fad2cf' };
                        break;
                    default:
                        // Para 'null', indefinidos o casos sin lógica aplicable
                        badgeStyle = { ...badgeStyle, backgroundColor: '#f1f3f4', color: '#5f6368', borderColor: '#e8eaed' };
                        break;
                }

                return (
                    <span style={badgeStyle}>
                        {estado ? estado : 'Sin definir'}
                    </span>
                );
            }
        },
        {
            key: "acciones",
            header: "",
            render: (_, row) => (
                <DropdownMenu
                    // Asegúrate de usar la propiedad correcta del ID (asumo id_instrumento)
                    isOpen={openDropdownId === row.id_instrumento}
                    onToggle={() => setOpenDropdownId(openDropdownId === row.id_instrumento ? null : row.id_instrumento)}
                    items={[
                        {
                            label: 'Editar instrumento',
                            icon: 'edit',
                            onClick: () => onEdit(row)
                        },
                        {
                            label: 'Eliminar instrumento',
                            icon: 'delete',
                            color: 'red',
                            onClick: () => onDelete(row)
                        }
                    ]}
                />
            )
        }
    ];

    return (
        <div className="listado-instrumentos">
            {/* Sección de Filtros y Categorización */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <select 
                        name="sectorId" 
                        value={params.sectorId || ''} 
                        onChange={handleFilterChange}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="">Todos los sectores</option>
                        {sectores.map(sec => (
                            <option key={sec.id_sector} value={sec.id_sector}>
                                {sec.descripcion}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <select 
                        name="tipo" 
                        value={params.tipo || ''} 
                        onChange={handleFilterChange}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="">Todos los tipos</option>
                        {tiposInstrumento.map((tipo, idx) => (
                            <option key={idx} value={tipo}>
                                {tipo}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <select 
                        name="estado" 
                        value={params.estado || ''} 
                        onChange={handleFilterChange}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                    >
                        <option value="">Todos los estados</option>
                        <option value="Verificado">Verificado</option>
                        <option value="Por caducar">Por caducar</option>
                        <option value="Caducado">Caducado</option>
                        <option value="Sin definir">Sin definir</option>
                    </select>
                </div>
            </div>

            {/* Tabla de Instrumentos */}
            <Table data={data} columns={columns} />

            {/* Paginación */}
            {totalPages>1 &&
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', padding: '10px 0' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                        Mostrando {data.length} de {totalRecords} registros
                    </span>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <button 
                            onClick={() => handlePageChange(params.page - 1)} 
                            disabled={params.page === 1}
                            style={{ cursor: params.page === 1 ? 'not-allowed' : 'pointer', padding: '6px 12px' }}
                            className="pagination-button"
                        >
                            <i className="material-icons">chevron_left</i>
                        </button>
                        <span style={{ fontSize: '14px' }}>
                            <span>{params.page} / {totalPages}</span>
                        </span>
                        <button 
                            onClick={() => handlePageChange(params.page + 1)} 
                            disabled={params.page === totalPages || totalPages === 0}
                            style={{ cursor: (params.page === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', padding: '6px 12px' }}
                            className="pagination-button"
                        >
                            <i className="material-icons">chevron_right</i>
                        </button>
                    </div>
                </div>
            }
        </div>
    );
}