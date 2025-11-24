import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import './AdminView.css';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ enTaller: 0, listos: 0 });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mechanicsLoad, setMechanicsLoad] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    useEffect(() => {
        checkUser();
    }, []);

    // 1. Primero averiguamos quién es el usuario
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (data) {
                setUserRole(data.role);
                // Una vez tenemos el rol y ID, cargamos los datos correctos
                getDashboardData(user.id, data.role);

                // Si es admin, cargamos la carga de trabajo
                if (data.role === 'admin') {
                    getMechanicsLoad();
                }
            }
        }
    };

    const getMechanicsLoad = async () => {
        // 1. Traer todos los mecánicos
        const { data: mechanics } = await supabase
            .from('profiles')
            .select('id, nombre, email')
            .eq('role', 'mecanico');

        if (!mechanics) return;

        // 2. Traer todas las órdenes activas (no entregadas)
        const { data: activeOrders } = await supabase
            .from('service_orders')
            .select('mechanic_id')
            .neq('estado', 'entregado');

        // 3. Calcular carga por mecánico
        const load = mechanics.map(mech => {
            const count = activeOrders?.filter(o => o.mechanic_id === mech.id).length || 0;
            return { ...mech, count };
        });

        setMechanicsLoad(load);
    };

    const getDashboardData = async (currentUserId: string, role: string) => {
        // Construimos la consulta base
        let queryTaller = supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .neq('estado', 'entregado');

        let queryListos = supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'listo');

        let queryRecent = supabase
            .from('service_orders')
            .select('*')
            .neq('estado', 'entregado') // <--- FILTRO AGREGADO: No mostrar entregados
            .order('created_at', { ascending: false })
            .limit(10); // Mostramos más para que se note

        // SI ES MECÁNICO: Filtramos SOLO lo suyo
        if (role === 'mecanico') {
            queryTaller = queryTaller.eq('mechanic_id', currentUserId);
            queryListos = queryListos.eq('mechanic_id', currentUserId);
            queryRecent = queryRecent.eq('mechanic_id', currentUserId);
        }

        // Ejecutamos las consultas
        const { count: countTaller } = await queryTaller;
        const { count: countListos } = await queryListos;
        const { data: recentData } = await queryRecent;

        setStats({
            enTaller: countTaller || 0,
            listos: countListos || 0
        });

        if (recentData) setRecentOrders(recentData);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    {/* Título dinámico según el rol */}
                    <h1>{userRole === 'admin' ? 'Centro de Control' : 'Mis Trabajos'}</h1>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        {userRole === 'admin' ? 'Vista General' : 'Órdenes Asignadas'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {userRole === 'admin' && (
                        <button className="new-order-btn" onClick={() => navigate('/admin/new')}>
                            <Plus size={24} />
                        </button>
                    )}
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                        <LogOut size={24} color="#666" />
                    </button>
                </div>
            </div>

            <div className="dashboard-summary">
                <div className="summary-card">
                    <span className="summary-count">{stats.enTaller}</span>
                    <span className="summary-label">En Proceso</span>
                </div>
                <div className="summary-card">
                    <span className="summary-count">{stats.listos}</span>
                    <span className="summary-label">Listas</span>
                </div>
            </div>

            {/* --- SECCIÓN DE CARGA DE TRABAJO (SOLO ADMIN) --- */}
            {userRole === 'admin' && mechanicsLoad.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '16px', marginBottom: '10px', color: '#444' }}>Carga de Mecánicos</h2>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                        {mechanicsLoad.map(mech => (
                            <div key={mech.id} style={{
                                background: 'white',
                                padding: '12px',
                                borderRadius: '10px',
                                minWidth: '140px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                border: mech.count === 0 ? '1px solid #10b981' : '1px solid transparent'
                            }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: mech.count === 0 ? '#d1fae5' : '#f3f4f6',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: mech.count === 0 ? '#059669' : '#666'
                                }}>
                                    <User size={16} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{mech.nombre || mech.email.split('@')[0]}</div>
                                    <div style={{ fontSize: '12px', color: mech.count === 0 ? '#059669' : '#666' }}>
                                        {mech.count === 0 ? '¡Libre!' : `${mech.count} activas`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por placa, modelo o cliente..."
                    className="form-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                />
            </div>

            {/* --- FILTROS RÁPIDOS (CHIPS) --- */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                <button
                    onClick={() => setFilterStatus(null)}
                    style={{
                        padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                        background: filterStatus === null ? '#2563eb' : '#f3f4f6',
                        color: filterStatus === null ? 'white' : '#666'
                    }}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilterStatus('recepcion')}
                    style={{
                        padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                        background: filterStatus === 'recepcion' ? '#ef4444' : '#fef2f2',
                        color: filterStatus === 'recepcion' ? 'white' : '#ef4444'
                    }}
                >
                    🔴 Urgentes
                </button>
                <button
                    onClick={() => setFilterStatus('esperando_repuesto')}
                    style={{
                        padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                        background: filterStatus === 'esperando_repuesto' ? '#f59e0b' : '#fffbeb',
                        color: filterStatus === 'esperando_repuesto' ? 'white' : '#f59e0b'
                    }}
                >
                    🟠 Repuestos
                </button>
                <button
                    onClick={() => setFilterStatus('listo')}
                    style={{
                        padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                        background: filterStatus === 'listo' ? '#10b981' : '#ecfdf5',
                        color: filterStatus === 'listo' ? 'white' : '#10b981'
                    }}
                >
                    🟢 Listos
                </button>
            </div>

            <div className="recent-activity">
                <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>
                    {userRole === 'admin' ? 'Actividad Reciente' : 'Mis Pendientes'}
                </h2>

                {recentOrders.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                        {userRole === 'mecanico'
                            ? '¡Todo limpio! No tienes motos asignadas.'
                            : 'No hay actividad reciente.'}
                    </p>
                ) : (
                    recentOrders
                        .filter(order => {
                            // 1. Filtro por Texto (Buscador)
                            if (searchTerm) {
                                const term = searchTerm.toLowerCase();
                                const matchesSearch = (
                                    (order.modelo_moto && order.modelo_moto.toLowerCase().includes(term)) ||
                                    (order.placa && order.placa.toLowerCase().includes(term)) ||
                                    (order.client_name && order.client_name.toLowerCase().includes(term))
                                );
                                if (!matchesSearch) return false;
                            }

                            // 2. Filtro por Estado (Chips)
                            if (filterStatus) {
                                if (filterStatus === 'recepcion') {
                                    // "Urgentes" puede incluir 'recepcion' y 'reparacion'
                                    return order.estado === 'recepcion' || order.estado === 'reparacion';
                                }
                                return order.estado === filterStatus;
                            }

                            return true;
                        })
                        .map((order) => (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    borderLeft: order.mechanic_id === userId ? '4px solid #2563eb' : '4px solid transparent'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '600' }}>{order.modelo_moto}</span>
                                    <span style={{
                                        color: order.estado === 'listo' ? '#10b981' : '#f59e0b',
                                        fontWeight: '500',
                                        fontSize: '14px'
                                    }}>
                                        {order.estado.replace('_', ' ')}
                                    </span>
                                </div>
                                <div style={{ fontSize: '14px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Placa: {order.placa}</span>
                                    {userRole === 'admin' && (
                                        <span style={{ fontSize: '12px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                                            {order.client_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
