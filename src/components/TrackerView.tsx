import React from 'react';
import './TrackerView.css';
import motoImage from '../assets/motorcycle.png';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
}

const TrackerView: React.FC = () => {
  // Mock data - in a real app this would come from props or an API
  const steps: TimelineStep[] = [
    {
      id: 'reception',
      title: 'Recepción',
      description: 'La moto ingresó al taller',
      status: 'completed'
    },
    {
      id: 'diagnosis',
      title: 'Revisión/Diagnóstico',
      description: 'Mecánico trabajando en tu moto',
      status: 'active'
    },
    {
      id: 'parts',
      title: 'Esperando Repuesto',
      description: 'Piezas solicitadas al proveedor',
      status: 'pending'
    },
    {
      id: 'ready',
      title: 'Listo para Entrega',
      description: '¡Tu moto está lista para rodar!',
      status: 'pending'
    }
  ];

  return (
    <div className="tracker-container">
      <header className="tracker-header">
        <h1>Rastreador</h1>
        <p>Estado de tu servicio en tiempo real</p>
      </header>

      <div className="moto-card">
        <div className="moto-image-container">
          <img src={motoImage} alt="Honda CGL 125" className="moto-image" />
        </div>
        <div className="moto-details">
          <h2 className="moto-name">Honda CGL 125</h2>
          <span className="moto-plate">Placa M123ABC</span>
          <div className="moto-diagnosis">
            <strong>Diagnóstico:</strong> Ajuste de válvulas y cambio de aceite
          </div>
        </div>
      </div>

      <div className="timeline">
        {steps.map((step) => (
          <div key={step.id} className={`timeline-item ${step.status}`}>
            <div className="timeline-marker">
              {step.status === 'completed' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
              {step.status === 'active' && (
                <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></div>
              )}
            </div>
            <div className="timeline-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <a 
        href="https://wa.me/1234567890" 
        target="_blank" 
        rel="noopener noreferrer"
        className="whatsapp-fab"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        Contactar al Mecánico
      </a>
    </div>
  );
};

export default TrackerView;
