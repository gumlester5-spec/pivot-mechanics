import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import Notification from './Notification'; // <--- 1. Importamos la notificación
import './AdminView.css';

const NewOrderForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // 2. Estado para la notificación
    const [notification, setNotification] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    const [mechanicsList, setMechanicsList] = useState<any[]>([]);
    const [clientsList, setClientsList] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        clientId: '',
        motoModel: '',
        plate: '',
        mechanic: '',
        diagnosis: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data: mechanics } = await supabase
                .from('profiles')
                .select('id, nombre, email')
                .eq('role', 'mecanico');

            if (mechanics) setMechanicsList(mechanics);

            const { data: clients } = await supabase
                .from('profiles')
                .select('id, nombre, email')
                .eq('role', 'cliente');

            if (clients) setClientsList(clients);
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const selectedClient = clientsList.find(c => c.id === formData.clientId);
        const clientNameStr = selectedClient ? (selectedClient.nombre || selectedClient.email) : 'Cliente Manual';

        try {
            const { error } = await supabase
                .from('service_orders')
                .insert([
                    {
                        client_id: formData.clientId,
                        client_name: clientNameStr,
                        modelo_moto: formData.motoModel,
                        placa: formData.plate,
                        diagnostico: formData.diagnosis,
                        estado: 'recepcion',
                        mechanic_id: formData.mechanic || null
                    }
                ]);

            if (error) throw error;

            // 3. MOSTRAR NOTIFICACIÓN Y ESPERAR
            setNotification({ msg: '¡Orden creada exitosamente!', type: 'success' });

            // Esperamos 2 segundos para que el usuario lea el mensaje antes de irnos
            setTimeout(() => {
                navigate('/admin');
            }, 2000);

        } catch (error: any) {
            // En caso de error, mostramos la notificación roja (y no navegamos)
            setNotification({ msg: 'Error: ' + error.message, type: 'error' });
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            {/* 4. RENDERIZAR EL COMPONENTE NOTIFICATION */}
            {notification && (
                <Notification
                    message={notification.msg}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="admin-header">
                <h1>Nueva Orden</h1>
                <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Cliente</label>
                        <select
                            name="clientId"
                            className="form-select"
                            value={formData.clientId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Seleccionar Cliente --</option>
                            {clientsList.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.nombre || client.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Modelo de Moto</label>
                        <input type="text" name="motoModel" className="form-input" placeholder="Ej. Honda CGL 125" value={formData.motoModel} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Placa</label>
                        <input type="text" name="plate" className="form-input" placeholder="Ej. M123ABC" value={formData.plate} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Asignar Mecánico</label>
                        <select name="mechanic" className="form-select" value={formData.mechanic} onChange={handleChange}>
                            <option value="">-- Sin asignar --</option>
                            {mechanicsList.map((mec) => (
                                <option key={mec.id} value={mec.id}>{mec.nombre || mec.email}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Problema Reportado</label>
                        <textarea name="diagnosis" className="form-textarea" value={formData.diagnosis} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Ingresar Moto'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewOrderForm;
