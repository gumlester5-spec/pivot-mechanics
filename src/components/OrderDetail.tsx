import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Save, CheckCircle, Wrench, AlertTriangle } from 'lucide-react';
import './AdminView.css'; // Reusing admin styles for consistency

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data, error } = await supabase
                .from('service_orders')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setOrder(data);
        } catch (error) {
            console.error('Error fetching order:', error);
            alert('Error al cargar la orden');
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const { error } = await supabase
                .from('service_orders')
                .update({ estado: newStatus })
                .eq('id', id);

            if (error) throw error;

            setOrder({ ...order, estado: newStatus });
            alert('¡Estado actualizado correctamente!');
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert('Error al actualizar estado: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="admin-container">Cargando...</div>;
    if (!order) return <div className="admin-container">Orden no encontrada</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'recepcion': return '#6b7280';
            case 'reparacion': return '#f59e0b';
            case 'esperando_repuesto': return '#ef4444';
            case 'listo': return '#10b981';
            case 'entregado': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1>Detalle de Orden</h1>
                </div>
            </div>

            <div className="form-container">
                <div style={{ marginBottom: '24px', padding: '16px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>Estado Actual</span>
                        <span style={{ fontSize: '18px', fontWeight: '600', color: getStatusColor(order.estado), textTransform: 'capitalize' }}>
                            {order.estado.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Acciones de Estado</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                            className="submit-btn"
                            style={{ background: '#f59e0b' }}
                            onClick={() => updateStatus('reparacion')}
                            disabled={updating || order.estado === 'reparacion'}
                        >
                            <Wrench size={18} style={{ marginRight: '8px' }} />
                            En Reparación
                        </button>
                        <button
                            className="submit-btn"
                            style={{ background: '#ef4444' }}
                            onClick={() => updateStatus('esperando_repuesto')}
                            disabled={updating || order.estado === 'esperando_repuesto'}
                        >
                            <AlertTriangle size={18} style={{ marginRight: '8px' }} />
                            Falta Repuesto
                        </button>
                        <button
                            className="submit-btn"
                            style={{ background: '#10b981' }}
                            onClick={() => updateStatus('listo')}
                            disabled={updating || order.estado === 'listo'}
                        >
                            <CheckCircle size={18} style={{ marginRight: '8px' }} />
                            Listo para Entrega
                        </button>
                        <button
                            className="submit-btn"
                            style={{ background: '#3b82f6' }}
                            onClick={() => updateStatus('entregado')}
                            disabled={updating || order.estado === 'entregado'}
                        >
                            <Save size={18} style={{ marginRight: '8px' }} />
                            Entregado
                        </button>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', margin: '24px 0' }}></div>

                <div className="form-group">
                    <label className="form-label">Cliente</label>
                    <div className="form-input" style={{ background: '#f9fafb' }}>{order.client_name}</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Moto</label>
                    <div className="form-input" style={{ background: '#f9fafb' }}>{order.modelo_moto}</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Placa</label>
                    <div className="form-input" style={{ background: '#f9fafb' }}>{order.placa}</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Diagnóstico Inicial</label>
                    <div className="form-textarea" style={{ background: '#f9fafb', minHeight: '100px' }}>{order.diagnostico}</div>
                </div>

                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '24px', textAlign: 'center' }}>
                    Ingreso: {new Date(order.created_at).toLocaleString()}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
