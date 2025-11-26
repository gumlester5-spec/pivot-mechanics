import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import './AdminView.css'; // Usaremos estilos globales

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {

    // Autodestrucción en 2 segundos (2000ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? '#10b981' : '#ef4444';

    return (
        <div className="notification-toast" style={{ borderLeft: `6px solid ${bgColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {type === 'success' ? <CheckCircle color={bgColor} /> : <XCircle color={bgColor} />}
                <div>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                        {type === 'success' ? '¡Éxito!' : 'Error'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{message}</p>
                </div>
            </div>
        </div>
    );
};

export default Notification;
