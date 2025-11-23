import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './AdminView.css';

const NewOrderForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // 1. Nueva lista para clientes
    const [mechanicsList, setMechanicsList] = useState<any[]>([]);
    const [clientsList, setClientsList] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        clientId: '', // Cambiamos clientName por clientId
        motoModel: '',
        plate: '',
        mechanic: '',
        diagnosis: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            // 2. Cargar Mecánicos
            const { data: mechanics } = await supabase
                .from('profiles')
                .select('id, nombre, email')
                .eq('role', 'mecanico');

            if (mechanics) setMechanicsList(mechanics);

            // 3. Cargar Clientes (NUEVO)
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

        // Buscar el nombre del cliente seleccionado para guardarlo como texto también (opcional, pero útil para ver rápido)
        const selectedClient = clientsList.find(c => c.id === formData.clientId);
        const clientNameStr = selectedClient ? (selectedClient.nombre || selectedClient.email) : 'Cliente Manual';

        try {
            const { error } = await supabase
                .from('service_orders')
                .insert([
                    {
                        client_id: formData.clientId, // <--- ¡LA CLAVE! Vinculamos al usuario real
                        client_name: clientNameStr,   // Guardamos el nombre solo por referencia visual
                        modelo_moto: formData.motoModel,
                        placa: formData.plate,
                        diagnostico: formData.diagnosis,
                        estado: 'recepcion',
                        mechanic_id: formData.mechanic || null
                    }
                ]);

            if (error) throw error;
            alert('Orden creada exitosamente!');
            navigate('/admin');
        } catch (error: any) {
            alert('Error: ' + error.message);
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
                    {/* 4. SELECT DE CLIENTES (Reemplaza al input de texto anterior) */}
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

                    <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Guardando...' : 'Ingresar Moto'}</button>
                </form>
            </div>
        </div>
    );
};

export default NewOrderForm;
