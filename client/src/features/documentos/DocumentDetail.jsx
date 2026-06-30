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

  const [fileType, setFileType] = useState('pdf'); 
  const [fileName, setFileName] = useState(`documento-${id}.pdf`);

  //Estado de carga
  const [loading, setLoading] = useState(false);
  const [documentoExiste, setDocumentoExiste] = useState(true);

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

        if (blob.type === 'application/pdf') {
            setFileType('pdf');
        } else if (blob.type.startsWith('image/')) {
            setFileType('image');
        } else {
            setFileType('unsupported');
        }

        if (blob.filename) {
            setFileName(blob.filename);
        } else {
            const ext = blob.type.startsWith('image/') ? 'png' : 'bin';
            setFileName(`pieza-tecnica-${id}.${ext}`);
        }

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
            setDocumentoExiste(false);
        } else {
            setError('Ocurrió un error cargando el documento. Intente más tarde');
            setDocumentoExiste(false);
        }
      }
    };
    fetchDocument();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [id]);

  useEffect(() => {
    // Si no hay un documento cargado, no hay nada que vigilar
    if (!blobUrl || error) return;

    const POLLING_INTERVAL = 180000; // 3 minutos

    const intervalId = setInterval(async () => {
      try {
        await apiCall(`${API_URL}/api/documentos/${id}/verificar-acceso`, {
          method: 'GET'
        });

      } catch (err) {
        if (err.status === 403 || err.status === 401) {
          
          URL.revokeObjectURL(blobUrl);
          setBlobUrl(null); 
          
          setError('Tu permiso para visualizar este documento ha expirado o fue revocado por un administrador.');
          
          clearInterval(intervalId);
        }
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
    
  }, [blobUrl, id, error]);

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
    link.download = link.download = fileName; 
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
      <div style={{marginTop:'15px', display:'flex', justifyContent:'center'}}>
        {estadoSolicitud === 'PENDIENTE'? (
          // UI para cuando ya está pedida
          <div style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>
            <i className='material-icons' style={{verticalAlign: 'middle', marginRight: '5px'}}>hourglass_empty</i>
            Solicitud en revisión
          </div>
        ) : (
          // UI para cuando se puede pedir
          <div style={{textAlign:'center'}}>
            <Can permission={null}>
              <Button 
                variant='default' 
                onClick={solicitarAcceso}
                disabled={loading}
                style={documentoExiste ? {display:'block'}:{display:'none'}}
              >
                {loading ? 'Procesando...' : 'Solicitar acceso'}
              </Button>
            </Can>
          </div>
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
      {fileType === 'pdf' && (
        <iframe 
          ref={printIframeRef}
          src={blobUrl}
          style={{ display: 'none' }} 
          title="Iframe de impresión"
        />
      )}

      <header className="viewer-toolbar">
        <div className="toolbar-section title-section">
          <span className="badge">{fileType === 'pdf' ? 'PDF' : fileType === 'image' ? 'IMG' : 'CAD/DOC'}</span>
          <span className="doc-title">{fileName}</span>
        </div>
        
        {/* Agrupamos paginación y zoom para mejor wrap en móviles */}
        <div className="toolbar-section controls-section">
          {fileType === 'pdf' && numPages > 1 && (
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
            <button className="toolbar-btn icon-only" onClick={zoomOut} disabled={fileType === 'unsupported'} title="Alejar">
              <i className='material-icons'>remove</i>
            </button>
            <span className="indicator-text">{Math.round(scale * 100)}%</span>
            <button className="toolbar-btn icon-only" onClick={zoomIn} disabled={fileType === 'unsupported'} title="Acercar">
              <i className='material-icons'>add</i>
            </button>
          </div>
        </div>

        <div className="toolbar-section actions-section">
          <Button variant="secondary" onClick={handleRotate} disabled={fileType === 'unsupported'} title="Rotar">
            <i className='material-icons' >rotate_90_degrees_ccw</i> 
          </Button>
          <Can permission={'imprimir_documentos'}>
            <Button variant="secondary" onClick={handlePrint} disabled={fileType !== 'pdf'} title="Imprimir">
              <i className='material-icons'>print</i>
            </Button>
          </Can>
          <Can permission={'descargar_documentos'}>
            <Button variant="default" onClick={handleDownload} title="Descargar">
              <i className='material-icons'>download</i>
              <span className='btn-text'>Descargar</span>
            </Button>
          </Can>
        </div>
      </header>

      <main className="viewer-main">

        <div className="pdf-scroll-container">
          {fileType === 'pdf' && (
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
          )}
          {fileType === 'image' && (
            <img 
              src={blobUrl} 
              alt={fileName}
              className="image-document"
              style={{ 
                transform: `scale(${scale}) rotate(${rotation}deg)`, 
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease' 
              }} 
            />
          )}
          {fileType === 'unsupported' && (
            <div className="unsupported-container">
                <i className='material-icons unsupported-icon'>engineering</i>
                <h3>Formato de Archivo Técnico</h3>
                <p>El archivo <strong>{fileName}</strong> requiere software especializado (CAD/CAM o utilidades industriales) para su visualización.</p>
                <Button onClick={handleDownload} variant="default" style={{marginTop: '1rem'}}>
                  Descargar Archivo Original
                </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};