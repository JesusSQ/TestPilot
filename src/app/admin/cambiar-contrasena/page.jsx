'use client';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import Input from '@/components/ui/Input';

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [status, setStatus] = useState({ message: '', isError: false });
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmNewPassword) {
            setStatus({ message: 'Las contraseñas no coinciden', isError: true });
            return;
        }

        setStatus({ message: 'Procesando...', isError: false });

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ message: 'Contraseña actualizada. Redirigiendo...', isError: false });
                setTimeout(() => router.push('/admin/inicio'), 2000);
            } else {
                setStatus({ message: data.message || 'Error al cambiar contraseña', isError: true });
            }
        } catch (error) {
            setStatus({ message: 'Error de conexión con el servidor', isError: true });
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Cambio Obligatorio de Contraseña</h2>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>Por seguridad, debes cambiar tu contraseña inicial para continuar.</p>
            
            <form onSubmit={handleSubmit}>
                <Input label="Contraseña Actual" type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required />
                <Input label="Nueva Contraseña" type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required />
                <Input label="Confirmar Nueva Contraseña" type="password" name="confirmNewPassword" value={formData.confirmNewPassword} onChange={handleChange} required />
                
                <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Actualizar y Acceder
                </button>
            </form>

            {status.message && (
                <p style={{ marginTop: '20px', textAlign: 'center', color: status.isError ? '#dc3545' : '#28a745', fontWeight: '500' }}>
                    {status.message}
                </p>
            )}
        </div>
    );
}

export default ChangePasswordPage;