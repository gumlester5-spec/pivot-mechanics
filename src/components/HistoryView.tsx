import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Search } from 'lucide-react'; // Agregamos Search
import { supabase } from '../lib/supabaseClient';
import './AdminView.css';

const HistoryView: React.FC = () => {
    const navigate = useNavigate();
    const [historyOrders, setHistoryOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    // 1. Nuevo estado para el texto de búsqueda
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (data) {
                setUserRole(data.role);
                fetchHistory(user.id, data.role);
            }
        }
    };

    const fetchHistory = async (userId: string, role: string) => {
        try {
            let query = supabase
                .from('service_orders')
                .select('*')
                .eq('estado', 'entregado')
                .order('created_at', { ascending: false });

            if (role === 'mecanico') {
                query = query.eq('mechanic_id', userId);
            }

            const { data, error } = await query;

            if (error) throw error;
            if (data) setHistoryOrders(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1>{userRole === 'admin' ? 'Historial Global' : 'Mis Trabajos'}</h1>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        {userRole === 'admin'
                            ? 'Todas las motos entregadas'
                            : 'Tu registro de reparaciones completadas'}
                    </p>
                </div>
                <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} color="#666" />
                </button>
            </div>

            {/* 2. BARRA DE BÚSQUEDA (Igual que en el Dashboard) */}
            <div style={{ marginBottom: '20px', position: 'relative' }}>
                <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                    type="text"
                    placeholder="🔍 Buscar por placa, modelo o cliente..."
                    className="form-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px', // Espacio para el icono
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                />
            </div>

            <div className="recent-activity">
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>Cargando historial...</p>
                ) : historyOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <Calendar size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                        <p>No hay registros en el historial.</p>
                    </div>
                ) : (
                    // 3. FILTRADO DINÁMICO
                    historyOrders
                        .filter(order => {
                            if (!searchTerm) return true;
                            const term = searchTerm.toLowerCase();
                            return (
                                (order.modelo_moto && order.modelo_moto.toLowerCase().includes(term)) ||
                                (order.placa && order.placa.toLowerCase().includes(term)) ||
                                (order.client_name && order.client_name.toLowerCase().includes(term))
                            );
                        })
                        .map((order) => (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/admin/orders/${order.id}`)} // <--- 1. HACER CLICKEABLE
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    borderLeft: '4px solid #10b981',
                                    cursor: 'pointer', // <--- 2. MANITA DE CLICK
                                    transition: 'transform 0.2s' // <--- 3. ANIMACIÓN SUAVE
                                }}
                                // Agregamos un efecto hover simple
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '600', color: '#333' }}>{order.modelo_moto}</span>
                                    <span style={{
                                        color: '#10b981',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <CheckCircle size={14} /> Entregado
                                    </span>
                                </div>
                                <div style={{ fontSize: '14px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Placa: {order.placa}</span>
                                    <span style={{ fontSize: '12px', fontWeight: '500' }}>
                                        Salida: {new Date(order.fecha_entrega || order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
                                    Cliente: {order.client_name}
                                </div>
                            </div>
                        ))
                )}

                {/* Mensaje si la búsqueda no encuentra nada */}
                {!loading && historyOrders.length > 0 &&
                    historyOrders.filter(o =>
                        (o.modelo_moto && o.modelo_moto.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (o.placa && o.placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (o.client_name && o.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).length === 0 && (
                        <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
                            No se encontraron resultados para "{searchTerm}"
                        </p>
                    )}
            </div>
        </div>
    );
};

export default HistoryView;
