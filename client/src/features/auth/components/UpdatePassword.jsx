import { useState } from 'react';
import { apiCall } from '../../../services/api';
import Button from '../../../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function UpdatePassword({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Debe completar todos los campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await apiCall(`${API_URL}/auth/update-password`, {
        method: 'PUT', 
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      setSuccess("¡Contraseña actualizada con éxito!");
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (err) {
      setError(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className='login-form' onSubmit={handleSubmit} style={{ width: '100%', padding: '10px 0' }}>
      <label>
        Contraseña actual:
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            placeholder='Ingrese su contraseña actual'
            type={showCurrentPassword ? "text" : "password"}
            onChange={(e) => setCurrentPassword(e.target.value)}
            value={currentPassword}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            style={{ background: 'transparent', color: '#9e9e9e', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
          >
            {showCurrentPassword ? 
              (<i className="material-icons">visibility</i>) : 
              (<i className="material-icons">visibility_off</i>)
            }
          </button>
        </div>
      </label>

      <label>
        Nueva contraseña:
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            placeholder='Ingrese su nueva contraseña'
            type={showNewPassword ? "text" : "password"}
            onChange={(e) => setNewPassword(e.target.value)}
            value={newPassword}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            style={{ background: 'transparent', color: '#9e9e9e', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
          >
            {showNewPassword ? 
              (<i className="material-icons">visibility</i>) : 
              (<i className="material-icons">visibility_off</i>)
            }
          </button>
        </div>
      </label>

      <label>
        Confirmar nueva contraseña:
        <input
          placeholder='Repita su nueva contraseña'
          type={showNewPassword ? "text" : "password"}
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          style={{ width: 'calc(100% - 34px)' }}
        />
      </label>

      {error && (
        <p className="error-message" style={{ color: "red", margin: "5px 0" }}>
          {error}
        </p>
      )}

      {success && (
        <p className="success-message" style={{ color: "green", margin: "5px 0" }}>
          {success}
        </p>
      )}

      <Button type="submit" variant='default' disabled={loading} style={{width:'100%', marginTop: '15px' }} >
        {loading ? "Actualizando..." : "Actualizar Contraseña"}
      </Button>
    </form>
  );
}