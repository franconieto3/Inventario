import './Modal.css'

export function Modal({titulo,descripcion, onClose, children}){
    return(
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <div style={{textAlign:'start'}}>
                        <h3 className="modal-title">{titulo}</h3>
                        <p style={{fontSize:'1rem',marginTop:'5px'}}>{descripcion}</p>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                        &times;
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
}