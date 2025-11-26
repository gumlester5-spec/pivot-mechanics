import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
    ArrowLeft, Save, CheckCircle, Wrench, AlertTriangle,
    Phone, MessageCircle, DollarSign, Plus, Trash2, Edit2,
    Clock, User, Calendar
} from 'lucide-react';
import Notification from './Notification';
import './AdminView.css';

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<any>(null);
    const [mechanicName, setMechanicName] = useState(''); // Nombre del mecánico
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    // Estados de Costos
    const [isEditingCosts, setIsEditingCosts] = useState(false);
    const [laborCost, setLaborCost] = useState<string>('');
    const [partsList, setPartsList] = useState<any[]>([]);
    const [newPartName, setNewPartName] = useState('');
    const [newPartCost, setNewPartCost] = useState('');

    const nameInputRef = useRef<HTMLInputElement>(null);
    const costInputRef = useRef<HTMLInputElement>(null);

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

            // Cargar costos
            setLaborCost(data.costo_mano_obra ? data.costo_mano_obra.toString() : '');
            setPartsList(data.repuestos_detalle || []);

            // Decidir si mostrar modo edición
            if (data.costo_mano_obra > 0 || (data.repuestos_detalle && data.repuestos_detalle.length > 0)) {
                setIsEditingCosts(false);
            } else {
                setIsEditingCosts(true);
            }

            // Buscar nombre del mecánico si existe
            if (data.mechanic_id) {
                const { data: mec } = await supabase
                    .from('profiles')
                    .select('nombre, email')
                    .eq('id', data.mechanic_id)
                    .single();
                if (mec) setMechanicName(mec.nombre || mec.email);
            }

        } catch (error) {
            navigate('/admin');
        } finally {
            setLoading(false);
        }
    };

    // --- FUNCIONES DE COSTOS (Igual que antes) ---
    const addPart = () => {
        if (!newPartName || !newPartCost) return;
        const newPart = { id: Date.now(), name: newPartName, cost: parseFloat(newPartCost) };
        setPartsList([...partsList, newPart]);
        setNewPartName('');
        setNewPartCost('');
        setTimeout(() => nameInputRef.current?.focus(), 50);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); costInputRef.current?.focus(); } };
    const handleCostKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); addPart(); } };
    const removePart = (partId: number) => { setPartsList(partsList.filter(p => p.id !== partId)); };
    const calculatePartsTotal = () => partsList.reduce((sum, part) => sum + (part.cost || 0), 0);
    const calculateGrandTotalPreview = () => {
        const listTotal = calculatePartsTotal();
        const labor = parseFloat(laborCost) || 0;
        const currentTypingCost = parseFloat(newPartCost) || 0;
        return listTotal + labor + currentTypingCost;
    };

    const showNotify = (msg: string, type: 'success' | 'error') => {
        setNotification({ msg, type });
    };

    const saveCosts = async () => {
        setUpdating(true);
        const totalRepuestos = calculatePartsTotal();
        const manoObra = parseFloat(laborCost) || 0;

        try {
            const { error } = await supabase
                .from('service_orders')
                .update({
                    costo_repuestos: totalRepuestos,
                    costo_mano_obra: manoObra,
                    repuestos_detalle: partsList
                })
                .eq('id', id);

            if (error) throw error;
            setUpdating(false);
            setIsEditingCosts(false);
            showNotify('Cotización guardada correctamente', 'success');
        } catch (error: any) {
            showNotify(error.message, 'error');
            setUpdating(false);
        }
    };

    // --- NUEVA LÓGICA DE ESTADO CON HISTORIAL ---
    const updateStatus = async (newStatus: string) => {
        if (order.estado === newStatus) return; // No hacer nada si es el mismo
        setUpdating(true);

        try {
            // 1. Crear la entrada nueva para el historial
            const newHistoryEntry = {
                status: newStatus,
                date: new Date().toISOString(),
                // Podríamos guardar quién hizo el cambio si quisiéramos más detalle
            };

            // 2. Obtener el historial actual y agregarle el nuevo
            const currentHistory = order.historial_estados || [];
            const updatedHistory = [...currentHistory, newHistoryEntry];

            // 3. Preparar actualizaciones
            const updates: any = {
                estado: newStatus,
                historial_estados: updatedHistory
            };

            if (newStatus === 'entregado') {
                updates.fecha_entrega = new Date().toISOString();
            }

            const { error } = await supabase
                .from('service_orders')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            setOrder({ ...order, ...updates });
            showNotify(`Estado cambiado a: ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');

        } catch (error: any) {
            showNotify(error.message, 'error');
        } finally {
            setUpdating(false);
        }
    };

    const getWhatsAppLink = (phone: string) => {
        if (!phone) return '#';
        let clean = phone.replace(/\D/g, '');
        if (clean.length === 8) clean = '502' + clean;
        const total = calculatePartsTotal() + (parseFloat(laborCost) || 0);
        let msg = `Hola ${order.client_name}, le escribimos de Taller Pivot sobre su moto ${order.modelo_moto}.`;
        if (total > 0) msg += ` El total es Q.${total.toFixed(2)}.`;
        return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
    };

    // Función para formatear fecha bonita
    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('es-GT', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="admin-container">Cargando...</div>;

    return (
        <div className="admin-container">
            {notification && <Notification message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}

            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1>Orden #{order.id}</h1>
                </div>
            </div>

            <div className="form-container">

                {/* BOTONES DE ESTADO (Igual que antes) */}
                <div className="form-group">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button className={`submit-btn ${order.estado === 'reparacion' ? 'active-status' : 'inactive-status'}`} style={{ background: '#f59e0b' }} onClick={() => updateStatus('reparacion')}>
                            <Wrench size={18} style={{ marginRight: '8px' }} /> Reparación
                        </button>
                        <button className={`submit-btn ${order.estado === 'esperando_repuesto' ? 'active-status' : 'inactive-status'}`} style={{ background: '#ef4444' }} onClick={() => updateStatus('esperando_repuesto')}>
                            <AlertTriangle size={18} style={{ marginRight: '8px' }} /> Repuesto
                        </button>
                        <button className={`submit-btn ${order.estado === 'listo' ? 'active-status' : 'inactive-status'}`} style={{ background: '#10b981' }} onClick={() => updateStatus('listo')}>
                            <CheckCircle size={18} style={{ marginRight: '8px' }} /> Listo
                        </button>
                        <button className={`submit-btn ${order.estado === 'entregado' ? 'active-status' : 'inactive-status'}`} style={{ background: '#3b82f6' }} onClick={() => updateStatus('entregado')}>
                            <Save size={18} style={{ marginRight: '8px' }} /> Entregado
                        </button>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', margin: '24px 0' }}></div>

                {/* --- COTIZACIÓN --- */}
                <div className="form-group" style={{
                    background: !isEditingCosts ? '#ecfdf5' : '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    border: !isEditingCosts ? '1px solid #10b981' : '1px solid #e5e7eb',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DollarSign size={20} color={!isEditingCosts ? '#10b981' : '#2563eb'} />
                            <h3 style={{ margin: 0, color: '#374151' }}>Cotización</h3>
                        </div>
                        {!isEditingCosts && (
                            <button
                                onClick={() => setIsEditingCosts(true)}
                                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                            >
                                <Edit2 size={16} /> Editar
                            </button>
                        )}
                    </div>

                    {/* LISTA DE REPUESTOS */}
                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ fontSize: '13px', color: '#6b7280' }}>Repuestos</label>

                        {partsList.map((part) => (
                            <div key={part.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed #eee' }}>
                                <span style={{ fontSize: '14px' }}>{part.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontWeight: '600' }}>Q.{part.cost}</span>
                                    {isEditingCosts && (
                                        <button onClick={() => removePart(part.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Formulario para agregar */}
                        {isEditingCosts && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                                <input
                                    ref={nameInputRef}
                                    type="text"
                                    placeholder="Nombre del repuesto"
                                    className="form-input"
                                    style={{ flex: 2, fontSize: '13px' }}
                                    value={newPartName}
                                    onChange={(e) => setNewPartName(e.target.value)}
                                    onKeyDown={handleNameKeyDown}
                                />
                                <input
                                    ref={costInputRef}
                                    type="number"
                                    placeholder="Q."
                                    className="form-input"
                                    style={{ flex: 1, fontSize: '13px' }}
                                    value={newPartCost}
                                    onChange={(e) => setNewPartCost(e.target.value)}
                                    onKeyDown={handleCostKeyDown}
                                />
                                <button
                                    onClick={addPart}
                                    style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* MANO DE OBRA */}
                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ fontSize: '13px', color: '#6b7280' }}>Mano de Obra</label>
                        {isEditingCosts ? (
                            <input
                                type="number"
                                className="form-input"
                                placeholder="0"
                                value={laborCost}
                                onChange={(e) => setLaborCost(e.target.value)}
                            />
                        ) : (
                            <div style={{ fontWeight: '600', fontSize: '16px' }}>Q. {parseFloat(laborCost || '0').toFixed(2)}</div>
                        )}
                    </div>

                    {/* TOTAL */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f3f4f6', paddingTop: '16px' }}>
                        <span style={{ fontWeight: 'bold', color: '#111827' }}>Total Final</span>
                        <span style={{ fontWeight: '800', fontSize: '22px', color: '#10b981' }}>
                            Q. {calculateGrandTotalPreview().toFixed(2)}
                        </span>
                    </div>

                    {isEditingCosts && (
                        <button
                            onClick={saveCosts}
                            className="submit-btn"
                            style={{ marginTop: '16px', background: '#111827' }}
                            disabled={updating}
                        >
                            {updating ? 'Guardando...' : 'Guardar Cotización'}
                        </button>
                    )}
                </div>


                <div style={{ borderTop: '1px solid #e5e7eb', margin: '24px 0' }}></div>

                {/* INFORMACIÓN DETALLADA */}
                <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={14} /> Mecánico Responsable
                        </div>
                        <div style={{ fontWeight: '500' }}>{mechanicName || 'Sin asignar'}</div>
                    </div>

                    <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} /> Fecha de Ingreso
                        </div>
                        <div style={{ fontWeight: '500' }}>{formatDate(order.created_at)}</div>
                    </div>

                    {order.fecha_entrega && (
                        <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                            <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={14} /> Fecha de Salida
                            </div>
                            <div style={{ fontWeight: '600', color: '#1e3a8a' }}>{formatDate(order.fecha_entrega)}</div>
                        </div>
                    )}
                </div>

                {/* CRONOLOGÍA / TIMELINE DE CAMBIOS */}
                <div style={{ marginTop: '30px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} /> Cronología del Servicio
                    </h3>

                    <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #e5e7eb' }}>
                        {/* Evento Inicial */}
                        <div style={{ marginBottom: '20px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-25px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#9ca3af' }}></div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>Ingreso a Taller</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{formatDate(order.created_at)}</div>
                        </div>

                        {/* Historial de Cambios */}
                        {order.historial_estados && order.historial_estados.map((h: any, index: number) => (
                            <div key={index} style={{ marginBottom: '20px', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-25px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }}></div>
                                <div style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>
                                    Cambio a: {h.status.replace('_', ' ')}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{formatDate(h.date)}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderDetail;
