import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import './AdminView.css';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Centro de Control</h1>
                <button className="new-order-btn" onClick={() => navigate('/admin/new')}>
                    <Plus size={24} />
                </button>
            </div>

            <div className="dashboard-summary">
                <div className="summary-card">
                    <span className="summary-count">3</span>
                    <span className="summary-label">En Taller</span>
                </div>
                <div className="summary-card">
                    <span className="summary-count">1</span>
                    <span className="summary-label">Para Entrega</span>
                </div>
            </div>

            <div className="recent-activity">
                <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Motos Activas</h2>
                {/* Placeholder list */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600' }}>Honda CGL 125</span>
                        <span style={{ color: '#f59e0b', fontWeight: '500', fontSize: '14px' }}>Revisión</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Placa: M123ABC</div>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600' }}>Yamaha YBR 125</span>
                        <span style={{ color: '#10b981', fontWeight: '500', fontSize: '14px' }}>Listo</span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Placa: M456XYZ</div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
