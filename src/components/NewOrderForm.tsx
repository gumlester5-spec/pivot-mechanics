import React, { useState, useEffect } from 'react'; // <--- Agregamos useEffect
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './AdminView.css';

const NewOrderForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estado para guardar la lista de mecánicos reales
    const [mechanicsList, setMechanicsList] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        clientName: '',
        motoModel: '',
        plate: '',
        mechanic: '',
        diagnosis: ''
    });

    // Al cargar la página, buscamos los mecánicos en la base de datos
    useEffect(() => {
        const fetchMechanics = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, nombre, email')
                .eq('role', 'mecanico'); // Solo traer los que son mecánicos

            if (data) {
                setMechanicsList(data);
            }
        };
        fetchMechanics();
    }, []);

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
            const { error } = await supabase
                .from('service_orders')
                .insert([
                    {
                        client_name: formData.clientName,
                        modelo_moto: formData.motoModel,
                        placa: formData.plate,
                        diagnostico: formData.diagnosis,
                        estado: 'recepcion',
                        // Aquí enviamos el UUID real o null si no seleccionó nada
                        mechanic_id: formData.mechanic || null
                    }
                ]);

            if (error) throw error;

            alert('Orden creada exitosamente!');
            navigate('/admin');
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
                    {/* ... (Tus inputs de Cliente, Modelo y Placa quedan IGUAL) ... */}

                    <div className="form-group">
                        <label className="form-label">Cliente</label>
                        <input type="text" name="clientName" className="form-input" placeholder="Nombre del cliente" value={formData.clientName} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Modelo de Moto</label>
                        <input type="text" name="motoModel" className="form-input" placeholder="Ej. Honda CGL 125" value={formData.motoModel} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Placa</label>
                        <input type="text" name="plate" className="form-input" placeholder="Ej. M123ABC" value={formData.plate} onChange={handleChange} required />
                    </div>

                    {/* ESTE ES EL CAMBIO IMPORTANTE: SELECT DINÁMICO */}
                    <div className="form-group">
                        <label className="form-label">Asignar Mecánico</label>
                        <select
                            name="mechanic"
                            className="form-select"
                            value={formData.mechanic}
                            onChange={handleChange}
                        >
                            <option value="">-- Sin asignar --</option>
                            {mechanicsList.map((mec) => (
                                <option key={mec.id} value={mec.id}>
                                    {mec.nombre || mec.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Problema Reportado</label>
                        <textarea name="diagnosis" className="form-textarea" placeholder="Describe el problema..." value={formData.diagnosis} onChange={handleChange} required />
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
