import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ClipboardList, User } from 'lucide-react';
import './AdminView.css';

const BottomNavigation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Función auxiliar para saber si el botón está activo
    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="bottom-nav">
            {/* Botón Inicio */}
            <button
                onClick={() => navigate('/admin')}
                className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
                <Home className="nav-icon" />
                <span>Inicio</span>
            </button>

            {/* Botón Historial */}
            <button
                onClick={() => navigate('/history')}
                className={`nav-item ${isActive('/history') ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
                <ClipboardList className="nav-icon" />
                <span>Historial</span>
            </button>

            {/* Botón Perfil */}
            <button
                onClick={() => navigate('/profile')}
                className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
                <User className="nav-icon" />
                <span>Perfil</span>
            </button>
        </nav>
    );
};

export default BottomNavigation;
