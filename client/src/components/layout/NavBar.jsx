import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
//Estilos
import "./NavBar.css"
import { UserAuth } from '../../features/auth/context/AuthContext';
import BackButton from '../ui/BackButton';
import {DropdownMenu} from '../ui/DropdownMenu';
import { Modal } from '../../components/ui/Modal';
import UpdatePassword from '../../features/auth/components/UpdatePassword';
import { useState } from 'react';

export default function NavBar(){
    const { user, logout} = UserAuth();
    const navigate = useNavigate();

    const [openDropdown, setOpenDropdown] = useState(false);
    const [updatePassword, setUpdatePassword] = useState(false);

    const handleLogOut = async ()=>{
        try{
            await logout();
        }catch(err){
            setError(err.message);
        }
    }

    const getInitials = (fullName) =>{
        return fullName
            .trim()
            .split(/\s+/)      
            .map(word => word[0].toUpperCase())
            .join('');
        }
    
    return(
    <>
        <div className='nav-bar'>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <BackButton/>
                <div className='logo-container' onClick={()=>navigate('/HomePage')}>
                    <img className="logo-img" src={logo} alt="logo"></img>
                    <span className='logo-text'>BIOPROTECE S.A.</span>
                </div>
            </div>
            <div className='user-container'>
                <button className='user-button'> {user? `${getInitials(user.name)}`: none }</button>
                <DropdownMenu
                    items={[
                        {
                            label: "Actualizar contraseña",
                            icon: "key",
                            onClick:()=>setUpdatePassword(true)
                        },{
                            label: "Cerrar sesión",
                            icon: "logout",
                            color: "red",
                            onClick:()=>handleLogOut()
                        }
                    ]}
                    isOpen={openDropdown}
                    onToggle={() => setOpenDropdown(!openDropdown)}
                />
            </div>  
        </div>
        {
            updatePassword && (
                <Modal
                    titulo="Actualizar contraseña"
                    descripcion={user.name}
                    onClose={()=>setUpdatePassword(false)}
                >
                    <UpdatePassword onClose={()=>setUpdatePassword(false)}/>
                </Modal>
            )
        }
    </>);
}