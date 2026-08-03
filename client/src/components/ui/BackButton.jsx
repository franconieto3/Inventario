import { useNavigate } from 'react-router-dom';
import './BackButton.css';

export default function BackButton() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button 
        onClick={handleGoBack} 
        className="back-button"
    >
      <i className="material-icons">arrow_back_ios</i>
    </button>
  );
}