import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './AdminView.css';

const NewOrderForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        motoModel: '',
        plate: '',
        mechanic: '',
        diagnosis: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // In a real app, we would look up the client ID or create a new user.
            // For now, we'll just insert into a 'tickets' table.
            // We assume the table 'tickets' exists with these columns.

            const { error } = await supabase
                .from('service_orders') // <--- Asegúrate que diga 'service_orders'
                .insert([
                    {
                        // Izquierda: Nombre en Base de Datos (Español)
                        // Derecha: Tu variable en React
                        client_name: formData.clientName,
                        modelo_moto: formData.motoModel, // Antes era moto_model
                        placa: formData.plate,           // Antes era plate
                        diagnostico: formData.diagnosis, // Antes era diagnosis
                        estado: 'recepcion',             // Antes era status
                        mechanic_id: formData.mechanic || null
                    }
                ]);

            if (error) throw error;

            alert('Orden creada exitosamente!');
            navigate('/admin'); // Go back to dashboard
        } catch (error: any) {
            console.error('Error creating order:', error);
            alert('Error al crear la orden: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Nueva Orden</h1>
                <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Cliente</label>
                        <input
                            type="text"
                            name="clientName"
                            className="form-input"
                            placeholder="Nombre del cliente"
                            value={formData.clientName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Modelo de Moto</label>
                        <input
                            type="text"
                            name="motoModel"
                            className="form-input"
                            placeholder="Ej. Honda CGL 125"
                            value={formData.motoModel}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Placa</label>
                        <input
                            type="text"
                            name="plate"
                            className="form-input"
                            placeholder="Ej. M123ABC"
                            value={formData.plate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Asignar Mecánico</label>
                        <select
                            name="mechanic"
                            className="form-select"
                            value={formData.mechanic}
                            onChange={handleChange}
                        >
                            <option value="">Seleccionar mecánico</option>
                            <option value="mec-1">Juan Pérez</option>
                            <option value="mec-2">Carlos López</option>
                            <option value="mec-3">Ana Martínez</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Problema Reportado / Diagnóstico Inicial</label>
                        <textarea
                            name="diagnosis"
                            className="form-textarea"
                            placeholder="Describe el problema..."
                            value={formData.diagnosis}
                            onChange={handleChange}
                            required
                        />
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
