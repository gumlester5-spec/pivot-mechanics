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
    let subscription: any;

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate('/');
          return;
        }

        // 1. Cargar orden inicial
        await fetchMyActiveOrder(user.id);

        // 2. Suscribirse a cambios en tiempo real
        subscription = supabase
          .channel('public:service_orders')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'service_orders',
              filter: `client_id=eq.${user.id}`,
            },
            (payload) => {
              console.log('Cambio en tiempo real:', payload);
              handleRealtimeUpdate(payload);
            }
          )
          .subscribe();

      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const fetchMyActiveOrder = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('client_id', userId)
        .neq('estado', 'entregado')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setOrder(data);
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      // Si se crea una nueva orden y no está entregada, la mostramos
      if (payload.new.estado !== 'entregado') {
        setOrder(payload.new);
      }
    } else if (payload.eventType === 'UPDATE') {
      // Si la orden actual se actualiza
      if (payload.new.estado === 'entregado') {
        // Si se entregó, limpiamos la vista (mostramos "Todo en orden")
        setOrder(null);
      } else {
        // Si cambió de estado (ej: recepcion -> reparacion), actualizamos
        setOrder(payload.new);
      }
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
            {order.estado === 'listo' ? (
              <h1 style={{ color: '#059669' }}>¡Tu Moto está Lista!</h1>
            ) : (
              <h1>Tu Moto</h1>
            )}
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

      {/* --- INICIO DE LA TARJETA DE PAGO --- */}
      {(order.costo_repuestos > 0 || order.costo_mano_obra > 0) && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
            Resumen de Costos
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#666' }}>
            <span>Repuestos</span>
            <span>Q. {order.costo_repuestos?.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#666' }}>
            <span>Mano de Obra</span>
            <span>Q. {order.costo_mano_obra?.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #eee', paddingTop: '16px' }}>
            <span style={{ fontWeight: 'bold', color: '#111827' }}>Total a Pagar</span>
            <span style={{ fontWeight: 'bold', fontSize: '24px', color: '#2563eb' }}>
              Q. {((order.costo_repuestos || 0) + (order.costo_mano_obra || 0)).toFixed(2)}
            </span>
          </div>
        </div>
      )}
      {/* --- FIN DE LA TARJETA DE PAGO --- */}

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
