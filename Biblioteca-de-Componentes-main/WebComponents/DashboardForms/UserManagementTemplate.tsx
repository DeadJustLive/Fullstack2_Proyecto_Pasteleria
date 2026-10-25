// @use(kind, props, limit, deps, state)
// @kind(component)
// @props(onBack: () => void)
// @limit(lines: 180, functions: 4, params: 1)
// @deps(@external: [react, lucide-react, sonner], @internal: [../lib/supabase])
import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, X, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface UserManagementProps {
    onBack: () => void;
}

export function UserManagement({ onBack }: UserManagementProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        fetchUsers();
        // Obtener el ID del usuario logueado para proteger su cuenta
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setCurrentUserId(data.user.id);
        });
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setUsers(data || []);
        } catch (err: any) {
            console.error(err);
            toast.error('Error cargando usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        // Input validation
        if (!email || !password || !name) {
            toast.error('Por favor, completa todos los campos');
            return;
        }

        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            setSubmitting(true);

            // Register via Supabase Auth
            const { error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (authError) throw authError;

            toast.success(`Usuario ${name} creado con éxito`);

            // Clear form
            setEmail('');
            setPassword('');
            setName('');

            fetchUsers();

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error al crear usuario');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (id: string, userName: string) => {
        // Proteger al administrador actual
        if (id === currentUserId) {
            toast.error('No puedes eliminar tu propia cuenta de administrador');
            return;
        }

        if (!confirm(`¿Estás seguro que deseas eliminar a ${userName}? Esta acción es irreversible.`)) {
            return;
        }

        try {
            toast.info('Eliminando... (Por ahora solo se elimina el perfil público)');
            // Need edge function or admin rights to delete from auth.users
            const { error } = await supabase.from('user_profiles').delete().eq('id', id);
            if (error) throw error;

            toast.success('Perfil eliminado');
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            toast.error('Error al intentar eliminar');
        }
    };

    return (
        <div className="um-overlay">
            {/* Header */}
            <div className="um-header" style={{ paddingTop: 'max(var(--sat, 0px), 0.5rem)' }}>
                <button onClick={onBack} className="um-back-btn">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="um-header-info">
                    <h1 className="um-title">Gestión de Personal</h1>
                    <p className="um-subtitle">Administra los accesos al sistema</p>
                </div>
            </div>

            <div className="um-content">
                {/* Form to Create New User */}
                <div className="um-form-card">
                    <div className="um-form-header">
                        <div className="um-form-icon-bg">
                            <UserPlus className="um-form-icon" />
                        </div>
                        <h2 className="um-form-title">Registrar Nuevo Empleado</h2>
                    </div>

                    <form onSubmit={handleCreateUser} className="um-form">
                        <div className="um-form-group">
                            <label className="um-form-label">Nombre Completo</label>
                            <div className="um-input-wrapper">
                                <User className="um-input-icon" />
                                <input
                                    type="text"
                                    placeholder="Ej: Juan Pérez"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="um-input"
                                />
                            </div>
                        </div>

                        <div className="um-form-group">
                            <label className="um-form-label">Correo Electrónico</label>
                            <div className="um-input-wrapper">
                                <Mail className="um-input-icon" />
                                <input
                                    type="email"
                                    placeholder="correo@tienda.cl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="um-input"
                                />
                            </div>
                        </div>

                        <div className="um-form-group">
                            <label className="um-form-label">Contraseña</label>
                            <div className="um-input-wrapper">
                                <Lock className="um-input-icon" />
                                <input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="um-input"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="um-submit-btn"
                        >
                            {submitting ? 'Procesando...' : 'Crear Cuenta'}
                        </button>
                    </form>
                </div>

                {/* Users List */}
                <div className="um-list-section">
                    <h2 className="um-list-title">Cuentas Registradas</h2>

                    {loading ? (
                        <div className="um-list-empty">Cargando personal...</div>
                    ) : users.length === 0 ? (
                        <div className="um-list-empty">No hay otros usuarios registrados</div>
                    ) : (
                        users.map((user) => {
                            const isAdmin = user.id === currentUserId;
                            return (
                                <div key={user.id} className="um-user-card">
                                    <div className="um-user-info">
                                        <div className={`um-user-avatar ${isAdmin ? 'um-user-avatar--admin' : ''}`}>
                                            {isAdmin
                                                ? <ShieldCheck className="um-user-avatar-icon" />
                                                : <User className="um-user-avatar-icon" />
                                            }
                                        </div>
                                        <div className="um-user-details">
                                            <div className="um-user-name">{user.name || 'Sin Nombre'}</div>
                                            <div className={`um-user-role ${isAdmin ? 'um-user-role--admin' : ''}`}>
                                                {isAdmin ? 'Administrador' : 'Miembro / Acceso Completo'}
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin ? (
                                        <div className="um-admin-badge">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteUser(user.id, user.name || 'desconocido')}
                                            className="um-user-delete-btn"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
