import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { LogOut, CalendarPlus, Wrench } from 'lucide-react'; // Agregamos iconos
import './TrackerView.css';
import motoImage from '../assets/motorcycle.png';

const TrackerView: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetchMyActiveOrder();
  }, []);

  const fetchMyActiveOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/');
        return;
      }

      // LÓGICA MEJORADA:
      // Buscamos PRIMERO si hay alguna orden que NO esté entregada todavía.
      // Así priorizamos lo que está pasando AHORA.
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('client_id', user.id)
        .neq('estado', 'entregado') // Solo traemos las activas
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setOrder(data);
      }
      // (Si no hay activas, order se queda en null y mostramos la pantalla de inicio limpia)

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

  const steps = [
    { id: 'recepcion', label: 'Recepción', desc: 'Ingreso al taller' },
    { id: 'reparacion', label: 'En Reparación', desc: 'Mecánico trabajando' },
    { id: 'esperando_repuesto', label: 'Repuestos', desc: 'Esperando piezas' },
    { id: 'listo', label: 'Listo', desc: 'Puede pasar a recoger' }
  ];

  const isStepActive = (stepId: string) => order && order.estado === stepId;

  const isStepCompleted = (stepId: string) => {
    if (!order) return false;
    const statusOrder = ['recepcion', 'esperando_repuesto', 'reparacion', 'listo', 'entregado'];
    return statusOrder.indexOf(order.estado) > statusOrder.indexOf(stepId);
  };

  if (loading) return <div className="tracker-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Cargando...</div>;

  // --- ESTADO 1: SIN MOTO EN TALLER (Pantalla Limpia) ---
  if (!order) return (
    <div className="tracker-container" style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>

      {/* Cabecera sencilla */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#111827' }}>Hola 👋</h1>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
          <LogOut size={24} />
        </button>
      </header>

      {/* Contenido central */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: 0.8 }}>
        <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
          <Wrench size={48} color="#9ca3af" />
        </div>
        <h2 style={{ fontSize: '20px', color: '#374151', marginBottom: '8px' }}>Todo en orden</h2>
        <p style={{ color: '#6b7280', maxWidth: '280px', margin: '0 auto' }}>
          No tienes ninguna moto en reparación actualmente.
        </p>
      </div>

      {/* Botón de acción único */}
      <a
        href="https://wa.me/50257152765?text=Hola, quisiera agendar una cita para mi moto."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        style={{ position: 'relative', bottom: 'auto', right: 'auto', width: '100%', justifyContent: 'center', marginTop: '20px' }}
      >
        <CalendarPlus size={20} />
        Agendar Cita
      </a>
    </div>
  );

  // --- ESTADO 2: MOTO EN TALLER (Rastreador) ---
  return (
    <div className="tracker-container">
      <header className="tracker-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Tu Moto</h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Orden #{order.id}</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <LogOut size={24} />
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
          // Ocultar 'esperando_repuesto' si no es el estado actual (para simplificar)
          if (step.id === 'esperando_repuesto' && order.estado !== 'esperando_repuesto') return null;

          const active = isStepActive(step.id);
          const completed = isStepCompleted(step.id);

          return (
            <div key={step.id} className={`timeline-item ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}>
              <div className="timeline-marker">
                {completed && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                {active && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></div>}
              </div>
              <div className="timeline-content">
                <h3 style={{ color: active ? '#2563eb' : 'inherit' }}>{step.label}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <a
        href={`https://wa.me/50257152765?text=Hola, tengo una duda sobre mi moto placa ${order.placa}`}
        target="_blank"
        className="whatsapp-fab"
      >
        Consultar al Mecánico
      </a>
    </div>
  );
};

export default TrackerView;
