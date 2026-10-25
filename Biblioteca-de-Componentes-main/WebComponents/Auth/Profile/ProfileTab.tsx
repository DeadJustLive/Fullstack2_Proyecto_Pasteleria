import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

export const ProfileTab = ({ user, updateProfile }: any) => {
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', currentPassword: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!profileForm.currentPassword) {
            toast.error('Ingresa tu contraseña para confirmar los cambios');
            return;
        }

        setIsUpdating(true);
        try {
            // Verificar contraseña ingresada conectando de nuevo
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: profileForm.currentPassword
            });

            if (signInError) {
                toast.error('Contraseña incorrecta');
                setIsUpdating(false);
                return;
            }

            await updateProfile({ name: profileForm.name, phone: profileForm.phone });
            setProfileForm({ ...profileForm, currentPassword: '' });
            toast.success('Datos actualizados correctamente');
        } catch (error) { 
            toast.error('Error al actualizar perfil'); 
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="profile-card">
            <h2 className="profile-page-title">Datos Personales</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-xl">
                <div>
                    <label className="form-label">Nombre Completo</label>
                    <input type="text" className="form-input" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                </div>
                <div>
                    <label className="form-label">Email</label>
                    <input type="email" disabled className="form-input-disabled" value={profileForm.email} />
                </div>
                <div>
                    <label className="form-label">Teléfono</label>
                    <input type="tel" className="form-input" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+56 9..." />
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <label className="form-label">Contraseña Actual <span className="text-red-500">*</span></label>
                    <p className="text-xs text-gray-500 mb-2">Ingresa tu contraseña para guardar los cambios</p>
                    <input type="password" required className="form-input" value={profileForm.currentPassword} onChange={e => setProfileForm({ ...profileForm, currentPassword: e.target.value })} placeholder="••••••••" />
                </div>

                <Button className="w-full md:w-auto px-8" disabled={isUpdating}>
                    {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </form>
        </div>
    );
};
