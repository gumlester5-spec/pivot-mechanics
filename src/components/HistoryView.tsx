import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './AdminView.css';

const HistoryView: React.FC = () => {
    const navigate = useNavigate();
    const [historyOrders, setHistoryOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('service_orders')
                .select('*')
                .eq('estado', 'entregado') // SOLO entregados
                .order('updated_at', { ascending: false });

            console.log('History Fetch Result:', { data, error }); // <--- DEBUG LOG
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
                    <h1>Historial de Entregas</h1>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        Motos entregadas y finalizadas
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
                        <p>Aún no hay motos entregadas en el historial.</p>
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
                                borderLeft: '4px solid #10b981', // Verde para entregado
                                opacity: 0.8 // Un poco más apagado para indicar historial
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
                                    {new Date(order.updated_at).toLocaleDateString()}
                                </span>
                            </div>
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
