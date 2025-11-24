import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { User, Mail, Shield, LogOut, Briefcase, Wrench, CheckCircle } from 'lucide-react';
import './AdminView.css';

const ProfileView: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ completed: 0, active: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProfileData();
    }, []);

    const getProfileData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // 1. Obtener datos del perfil
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setProfile(profileData);

                // 2. SI ES MECÁNICO: Calcular sus estadísticas
                if (profileData?.role === 'mecanico') {
                    // Contar motos entregadas (Histórico)
                    const { count: completedCount } = await supabase
                        .from('service_orders')
                        .select('*', { count: 'exact', head: true })
                        .eq('mechanic_id', user.id)
                        .eq('estado', 'entregado');

                    // Contar motos activas (En taller)
                    const { count: activeCount } = await supabase
                        .from('service_orders')
                        .select('*', { count: 'exact', head: true })
                        .eq('mechanic_id', user.id)
                        .neq('estado', 'entregado');

                    setStats({
                        completed: completedCount || 0,
                        active: activeCount || 0
                    });
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) return <div className="admin-container" style={{ textAlign: 'center', marginTop: '40px' }}>Cargando perfil...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Mi Perfil</h1>
            </div>

            {/* Tarjeta Principal */}
            <div className="form-container" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                    width: '80px', height: '80px', background: '#eff6ff', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px auto', color: '#2563eb'
                }}>
                    <User size={40} />
                </div>

                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>
                    {profile?.nombre || 'Mecánico'}
                </h2>
                <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                    {profile?.email}
                </p>

                <div style={{
                    display: 'inline-block', marginTop: '12px', padding: '4px 12px',
                    borderRadius: '20px', background: '#f3f4f6', fontSize: '12px',
                    fontWeight: '600', textTransform: 'uppercase', color: '#4b5563'
                }}>
                    {profile?.role === 'mecanico' ? '🛠️ Mecánico Oficial' : '🛡️ Administrador'}
                </div>
            </div>

            {/* SECCIÓN DE ESTADÍSTICAS (SOLO PARA EL MECÁNICO) */}
            {profile?.role === 'mecanico' && (
                <div className="dashboard-summary">
                    <div className="summary-card">
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                            <CheckCircle size={24} color="#10b981" />
                        </div>
                        <span className="summary-count" style={{ color: '#10b981' }}>{stats.completed}</span>
                        <span className="summary-label">Reparaciones Totales</span>
                    </div>
                    <div className="summary-card">
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                            <Wrench size={24} color="#f59e0b" />
                        </div>
                        <span className="summary-count" style={{ color: '#f59e0b' }}>{stats.active}</span>
                        <span className="summary-label">En Curso</span>
                    </div>
                </div>
            )}

            {/* Detalles Generales */}
            <div className="form-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <Mail size={20} color="#9ca3af" />
                    <div>
                        <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>Correo</span>
                        <span style={{ fontSize: '14px' }}>{profile?.email}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <Shield size={20} color="#9ca3af" />
                    <div>
                        <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>Nivel de Acceso</span>
                        <span style={{ fontSize: '14px' }}>
                            {profile?.role === 'admin' ? 'Control Total' : 'Gestión de Órdenes'}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
                    <Briefcase size={20} color="#9ca3af" />
                    <div>
                        <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>Taller</span>
                        <span style={{ fontSize: '14px' }}>Pivot Mechanics</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="submit-btn"
                style={{
                    marginTop: '24px',
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
            >
                <LogOut size={20} />
                Cerrar Sesión
            </button>
        </div>
    );
};

export default ProfileView;
