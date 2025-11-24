import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './AdminView.css';

const HistoryView: React.FC = () => {
    const navigate = useNavigate();
    const [historyOrders, setHistoryOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        checkUser();
    }, []);

    // 1. Verificar quién está conectado
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
                // Pasamos el ID y el ROL a la función de carga
                fetchHistory(user.id, data.role);
            }
        }
    };

    const fetchHistory = async (userId: string, role: string) => {
        try {
            // 2. Construir la consulta base
            let query = supabase
                .from('service_orders')
                .select('*')
                .eq('estado', 'entregado') // Solo lo finalizado
                .order('created_at', { ascending: false }); // Ordenado por fecha (la corrección que hicimos antes)

            // 3. SI ES MECÁNICO: Filtrar solo SU trabajo
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
                    {/* Título personalizado según el rol */}
                    <h1>{userRole === 'admin' ? 'Historial Global' : 'Mis Trabajos Finalizados'}</h1>
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

            <div className="recent-activity">
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>Cargando historial...</p>
                ) : historyOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <Calendar size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                        <p>
                            {userRole === 'admin'
                                ? 'Aún no hay motos entregadas en el sistema.'
                                : 'Aún no has completado ninguna reparación.'}
                        </p>
                    </div>
                ) : (
                    historyOrders.map((order) => (
                        <div
                            key={order.id}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                borderLeft: '4px solid #10b981', // Verde de éxito
                            }}
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
                                <span style={{ fontSize: '12px' }}>
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {/* Solo el Admin necesita ver el nombre del mecánico en el historial, 
                                pero siempre es útil ver el Cliente */}
                            <div style={{ marginTop: '8px', fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
                                Cliente: {order.client_name}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryView;
