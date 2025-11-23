import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react'; // Usamos iconos bonitos
import './AdminView.css'; // Reutilizamos estilos del form

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Iniciar sesión en Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Consultar la tabla 'profiles' para saber el ROL
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single();

                if (profileError) throw profileError;

                // 3. Redirigir según el rol
                if (profile?.role === 'admin' || profile?.role === 'mecanico') {
                    navigate('/admin');
                } else {
                    navigate('/tracker');
                }
            }
        } catch (error: any) {
            alert('Error al entrar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="admin-header" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '32px', color: '#2563eb' }}>Taller Pivot</h1>
                    <p style={{ color: '#666' }}>Inicia sesión para continuar</p>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Correo Electrónico</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Mail size={20} style={{ position: 'absolute', left: '12px', color: '#999' }} />
                            <input
                                type="email"
                                className="form-input"
                                style={{ paddingLeft: '40px' }}
                                placeholder="usuario@pivot.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Lock size={20} style={{ position: 'absolute', left: '12px', color: '#999' }} />
                            <input
                                type="password"
                                className="form-input"
                                style={{ paddingLeft: '40px' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Verificando...' : 'Entrar'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
                    ¿No tienes cuenta? Pide a administración que te registre.
                </p>
            </div>
        </div>
    );
};

export default Login;
