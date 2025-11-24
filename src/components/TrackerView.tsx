import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LogOut, CheckCircle } from 'lucide-react';
import './TrackerView.css';
import motoImage from '../assets/motorcycle.png';

const TrackerView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

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

      // 2. Buscar la orden activa más reciente de este cliente
      // QUITAMOS el filtro .neq('estado', 'entregado') para poder mostrar la confirmación de entrega
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
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
    { id: 'esperando_repuesto', label: 'Repuestos', desc: 'Esperando piezas' },
    { id: 'listo', label: 'Listo', desc: 'Puede pasar a recoger' }
  ];

  // Lógica para saber qué pasos están completados
  const isStepActive = (stepId: string) => {
    if (!order) return false;
    if (order.estado === stepId) return true;
    return false;
  };

  const isStepCompleted = (stepId: string) => {
    if (!order) return false;
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
      </header>
    </div>
  );

  // VISTA ESPECIAL: MOTO ENTREGADA
  if (order.estado === 'entregado') {
    return (
      <div className="tracker-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <header className="tracker-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>¡Entregada!</h1>
              <p>Orden #{order.id}</p>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <LogOut size={24} color="#666" />
            </button>
          </div>
        </header>

        <div style={{ margin: '40px 0' }}>
          <CheckCircle size={80} color="#4CAF50" style={{ marginBottom: '20px' }} />
          <h2>¡Tu moto ha sido entregada!</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Gracias por confiar en nosotros. Esperamos que disfrutes tu viaje.
          </p>

          <div className="moto-card" style={{ marginTop: '30px', opacity: 0.8 }}>
            <div className="moto-details">
              <h3 className="moto-name">{order.modelo_moto}</h3>
              <span className="moto-plate">{order.placa}</span>
            </div>
          </div>
        </div>

        <a
          href={`https://wa.me/50212345678?text=Hola, tengo una consulta sobre mi servicio finalizado (Orden #${order.id})`}
          target="_blank"
          className="whatsapp-fab"
        >
          Soporte / Garantía
        </a>
      </div>
    );
  }

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
