import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, User } from 'lucide-react';
import './AdminView.css';

const BottomNavigation: React.FC = () => {
    return (
        <nav className="bottom-nav">
            <NavLink
                to="/admin"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <Home className="nav-icon" />
                <span>Inicio</span>
            </NavLink>

            <NavLink
                to="/history"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <ClipboardList className="nav-icon" />
                <span>Historial</span>
            </NavLink>

            <NavLink
                to="/profile"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <User className="nav-icon" />
                <span>Perfil</span>
            </NavLink>
        </nav>
    );
};

export default BottomNavigation;
