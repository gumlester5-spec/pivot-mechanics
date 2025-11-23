import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './AdminView.css';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ enTaller: 0, listos: 0 });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        getDashboardData();
    }, []);

    const getDashboardData = async () => {
        // 1. Contar motos en taller (estado no es 'entregado')
        const { count: countTaller } = await supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .neq('estado', 'entregado'); // neq = not equal

        // 2. Contar motos listas
        const { count: countListos } = await supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'listo');

        setStats({
            enTaller: countTaller || 0,
            listos: countListos || 0
        });

        // 3. Traer las ultimas 3 órdenes
        const { data } = await supabase
            .from('service_orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

        if (data) setRecentOrders(data);
    };

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
                    <span className="summary-count">{stats.enTaller}</span>
                    <span className="summary-label">En Taller</span>
                </div>
                <div className="summary-card">
                    <span className="summary-count">{stats.listos}</span>
                    <span className="summary-label">Para Entrega</span>
                </div>
            </div>

            <div className="recent-activity">
                <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Motos Activas</h2>
                {recentOrders.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '14px' }}>No hay actividad reciente.</p>
                ) : (
                    recentOrders.map((order) => (
                        <div key={order.id} style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600' }}>{order.modelo_moto}</span>
                                <span style={{ color: '#f59e0b', fontWeight: '500', fontSize: '14px' }}>{order.estado}</span>
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>Placa: {order.placa}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
