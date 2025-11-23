import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LogOut } from 'lucide-react';
import './TrackerView.css';
import motoImage from '../assets/motorcycle.png';

const TrackerView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [debugUserId, setDebugUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyOrder();
  }, []);

  const fetchMyOrder = async () => {
    try {
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/'); // Si no hay usuario, mandar al login
        return;
      }
      setDebugUserId(user.id);

      // 2. Buscar la orden activa más reciente de este cliente
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('client_id', user.id) // <--- Filtramos por SU id
        .neq('estado', 'entregado') // Solo mostrar si no ha sido entregada (opcional)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignoramos error si no hay datos
        console.error('Error:', error);
      }

      if (data) setOrder(data);

    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Definimos los pasos visuales
  const steps = [
    { id: 'recepcion', label: 'Recepción', desc: 'Moto en taller' },
    { id: 'reparacion', label: 'En Reparación', desc: 'Mecánico trabajando' },
    { id: 'esperando_repuesto', label: 'Repuestos', desc: 'Esperando piezas' }, // Opcional
    { id: 'listo', label: 'Listo', desc: 'Puede pasar a recoger' }
  ];

  // Lógica para saber qué pasos están completados
  const isStepActive = (stepId: string) => {
    if (!order) return false;
    if (order.estado === stepId) return true; // Es el estado actual
    return false;
  };

  const isStepCompleted = (stepId: string) => {
    if (!order) return false;
    // Definimos un orden lógico de progreso
    const statusOrder = ['recepcion', 'esperando_repuesto', 'reparacion', 'listo', 'entregado'];
    const currentIndex = statusOrder.indexOf(order.estado);
    const stepIndex = statusOrder.indexOf(stepId);
    return currentIndex > stepIndex;
  };

  if (loading) return <div className="tracker-container">Cargando tu moto...</div>;

  if (!order) return (
    <div className="tracker-container">
      <header className="tracker-header">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h1>Sin Servicio Activo</h1>
          <button onClick={handleLogout}><LogOut size={20} /></button>
        </div>
        <p>No tienes ninguna moto en reparación actualmente.</p>

        {/* DEBUG SECTION - REMOVE LATER */}
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px', fontSize: '12px', color: '#333' }}>
          <p><strong>Debug Info:</strong></p>
          <p>User ID (Auth): {debugUserId || 'No User'}</p>
          <p>Check console for full details.</p>
        </div>
      </header>
    </div>
  );

  return (
    <div className="tracker-container">
      <header className="tracker-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Rastreador</h1>
            <p>Orden #{order.id}</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogOut size={24} color="#666" />
          </button>
        </div>
      </header>

      <div className="moto-card">
        <div className="moto-image-container">
          <img src={motoImage} alt="Moto" className="moto-image" />
        </div>
        <div className="moto-details">
          <h2 className="moto-name">{order.modelo_moto}</h2>
          <span className="moto-plate">{order.placa}</span>
          <div className="moto-diagnosis">
            <strong>Diagnóstico:</strong> {order.diagnostico}
          </div>
        </div>
      </div>

      <div className="timeline">
        {steps.map((step) => {
          // Ocultar 'esperando_repuesto' si el estado actual no es ese, para limpiar la vista (opcional)
          if (step.id === 'esperando_repuesto' && order.estado !== 'esperando_repuesto') return null;

          const active = isStepActive(step.id);
          const completed = isStepCompleted(step.id);

          return (
            <div key={step.id} className={`timeline-item ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}>
              <div className="timeline-marker">
                {completed && <span style={{ color: 'white' }}>✓</span>}
                {active && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></div>}
              </div>
              <div className="timeline-content">
                <h3>{step.label}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón de WhatsApp dinámico con mensaje pre-llenado */}
      <a
        href={`https://wa.me/50212345678?text=Hola, consulto por mi moto placa ${order.placa}`}
        target="_blank"
        className="whatsapp-fab"
      >
        Contactar al Taller
      </a>
    </div>
  );
};

export default TrackerView;
