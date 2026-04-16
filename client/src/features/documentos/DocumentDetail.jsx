import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { apiCall } from '../../services/api';
import './DocumentDetail.css';
import Button from '../../components/ui/Button';
import Can from '../../components/Can';
import { Spinner } from '../../components/ui/Spinner';

// Configuración del worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const DocumentDetail = () => {
  const { id } = useParams();
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);

  //Estado de carga
  const [loading, setLoading] = useState(false);

  // Estados para react-pdf
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // Nuevo estado para el Zoom (Resolución dinámica)
  // Iniciamos en 1.5 o 1.2 para móviles para no saturar la memoria inicial
  const [scale, setScale] = useState(1.2); 

  const [estadoSolicitud, setEstadoSolicitud] = useState(null);

  const printIframeRef = useRef(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const blob = await apiCall(`${API_URL}/api/documentos/${id}/stream`, {
          method: 'GET', 
          responseType: 'blob'
        });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

      } catch (err) {
        if (err.status === 403) {
          const estadoDB = err.data?.estado_solicitud;
          setEstadoSolicitud(estadoDB);

          if (estadoDB === 'PENDIENTE') {
            setError('Ya posees una solicitud en curso para visualizar este documento. Aguarda su aprobación.');
          } else {
            setError('No tienes permisos para ver el documento.');
          }

        } else if (err.status === 404) {
            setError('El documento no existe');
        } else {
            setError('Ocurrió un error cargando el documento. Intente más tarde');
        }
      }
    };
    fetchDocument();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // Controles
  const changePage = (offset) => setPageNumber(prev => prev + offset);
  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  
  // Controles de Zoom
  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 4)); // Límite máx de 4x
  const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5)); // Límite mín de 0.5x

  const handleDownload = () => {
    if (!blobUrl) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `documento-tecnico-${id}.pdf`; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (printIframeRef.current && printIframeRef.current.contentWindow) {
      printIframeRef.current.contentWindow.print();
    }
  };  

  const solicitarAcceso = async () => {
    try{
      setLoading(true);
      const res = await apiCall(`${API_URL}/api/documentos/solicitud-acceso/${id}`,{
        method:'POST'
      })

      setEstadoSolicitud('PENDIENTE');
      setError('Ya posees una solicitud en curso para visualizar este documento. Aguarda su aprobación.');
    
    }catch(err){
      console.log(err.message);
      alert(err.message);
    }finally{
      setLoading(false);
    }
  }

  if (error) return (
    <div style={{textAlign:'center', padding: '20px'}}>
      <div className="viewer-message error-msg">
        {error}
      </div>
      <div style={{marginTop:'15px'}}>
        {estadoSolicitud === 'PENDIENTE' ? (
          // UI para cuando ya está pedida
          <div style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>
            <i className='material-icons' style={{verticalAlign: 'middle', marginRight: '5px'}}>hourglass_empty</i>
            Solicitud en revisión
          </div>
        ) : (
          // UI para cuando se puede pedir
          <Button 
            variant='default' 
            onClick={solicitarAcceso}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Solicitar acceso'}
          </Button>
        )}
      </div>
    </div>
  );

  if (!blobUrl) return (
    <>
      <div style={{ position: 'relative', minHeight: '200px' }}>
          <Spinner 
            size={40} 
            color="#64748b" 
            center 
            label = 'Cargando documento seguro...'
          />
      </div>
    </>
    
  );

  return (
    <div className="viewer-layout">
      <iframe 
        ref={printIframeRef}
        src={blobUrl}
        style={{ display: 'none' }} 
        title="Iframe de impresión"
      />

      <header className="viewer-toolbar">
        <div className="toolbar-section title-section">
          <span className="badge">PDF</span>
          <span className="doc-title">Doc #{id}</span>
        </div>
        
        {/* Agrupamos paginación y zoom para mejor wrap en móviles */}
        <div className="toolbar-section controls-section">
          {numPages > 1 && (
            <div className="button-group">
              <button className="toolbar-btn icon-only" disabled={pageNumber <= 1} onClick={previousPage}>
                <i className='material-icons'>chevron_left</i>
              </button>
              <span className="indicator-text">{pageNumber} / {numPages}</span>
              <button className="toolbar-btn icon-only" disabled={pageNumber >= numPages} onClick={nextPage}>
                <i className='material-icons'>chevron_right</i>
              </button>
            </div>
          )}

          <div className="button-group">
            <button className="toolbar-btn icon-only" onClick={zoomOut} title="Alejar">
              <i className='material-icons'>remove</i>
            </button>
            <span className="indicator-text">{Math.round(scale * 100)}%</span>
            <button className="toolbar-btn icon-only" onClick={zoomIn} title="Acercar">
              <i className='material-icons'>add</i>
            </button>
          </div>
        </div>

        <div className="toolbar-section actions-section">
          <Button variant="secondary" onClick={handleRotate} title="Rotar">
            <i className='material-icons' >rotate_90_degrees_ccw</i> 
          </Button>
          <Can permission={null}>
            <Button variant="secondary" onClick={handlePrint} title="Imprimir">
              <i className='material-icons'>print</i>
            </Button>
          </Can>
          <Can permission={null}>
            <Button variant="default" onClick={handleDownload} title="Descargar">
              <i className='material-icons'>download</i>
              <span className='btn-text'>Descargar</span>
            </Button>
          </Can>
        </div>
      </header>

      <main className="viewer-main">
        {/* Este contenedor es la clave para permitir el paneo */}
        <div className="pdf-scroll-container">
          <Document 
            file={blobUrl} 
            onLoadSuccess={onDocumentLoadSuccess}
            error={<div className="viewer-message error-msg">Error al cargar el PDF.</div>}
            loading={<div className="viewer-message">Renderizando documento...</div>}
            className="pdf-document"
          >
            <Page 
              pageNumber={pageNumber} 
              rotate={rotation} 
              renderTextLayer={false} 
              renderAnnotationLayer={false} 
              className="pdf-page"
              scale={scale} 
            />
          </Document>
        </div>
      </main>
    </div>
  );
};