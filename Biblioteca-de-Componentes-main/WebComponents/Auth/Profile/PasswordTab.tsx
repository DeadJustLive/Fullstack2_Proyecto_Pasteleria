import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

export const PasswordTab = ({ changePassword }: any) => {
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error('Las contraseñas nuevas no coinciden');
            return;
        }
        try {
            await changePassword(passwordForm.current, passwordForm.new);
            toast.success('Contraseña actualizada con éxito');
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (error) { toast.error('Error al cambiar contraseña.'); }
    };

    return (
        <div className="profile-card">
            <h2 className="profile-page-title">Cambiar Contraseña</h2>
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
                <div>
                    <label className="form-label">Contraseña actual</label>
                    <input type="password" required className="form-input" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} />
                </div>
                <div>
                    <label className="form-label">Contraseña nueva</label>
                    <input type="password" required className="form-input" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} />
                </div>
                <div>
                    <label className="form-label">Confirmar contraseña nueva</label>
                    <input type="password" required className="form-input" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                </div>
                <Button className="w-full md:w-auto px-8">Actualizar Contraseña</Button>
            </form>
        </div>
    );
};
