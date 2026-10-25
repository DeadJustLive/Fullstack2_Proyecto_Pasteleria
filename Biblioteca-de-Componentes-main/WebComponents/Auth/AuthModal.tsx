import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Friendly Spanish error messages for Supabase auth errors
function friendlyError(message: string): string {
    if (message.includes('Invalid login credentials')) return 'El correo o la contraseña son incorrectos';
    if (message.includes('Email not confirmed')) return 'Por favor confirma tu correo electrónico antes de iniciar sesión';
    if (message.includes('User already registered')) return 'Ya existe una cuenta con este correo';
    if (message.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres';
    if (message.includes('Unable to validate email address')) return 'El correo no es válido';
    if (message.includes('rate limit')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo';
    return message;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState(false);
    const { login, requestPasswordReset } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (isForgotPassword) {
                await requestPasswordReset(formData.email);
                setResetSent(true);
            } else {
                await login(formData.email, formData.password);
                onClose();
            }
        } catch (err: any) {
            setError(friendlyError(err.message || 'Ocurrió un error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        setResetSent(false);
        setIsForgotPassword(false);
        setFormData({ email: '', password: '' });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-[var(--color-brand-primary)] p-6 text-white text-center relative">
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-2">
                            {isForgotPassword ? 'Recuperar Contraseña' : '¡Hola de nuevo!'}
                        </h2>
                        <p className="text-white/80">
                            {isForgotPassword
                                ? 'Ingresa tu email para recibir un enlace de recuperación'
                                : 'Ingresa a tu cuenta para continuar'}
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {resetSent ? (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                                <h3 className="font-bold text-lg text-gray-800">¡Correo enviado!</h3>
                                <p className="text-gray-600 text-sm">
                                    Revisa tu bandeja de entrada. Te enviamos un enlace para restablecer tu contraseña.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="w-full mt-4 py-3 bg-[var(--color-brand-primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                                >
                                    Entendido
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none transition-all"
                                            placeholder="tu@email.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {!isForgotPassword && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none transition-all"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <Button className="w-full py-4 text-lg shadow-lg mt-6" disabled={isLoading}>
                                    {isLoading
                                        ? 'Cargando...'
                                        : isForgotPassword
                                            ? 'Enviar Enlace'
                                            : 'Iniciar Sesión'
                                    }
                                </Button>
                            </form>
                        )}

                        {!resetSent && (
                            <div className="mt-6 text-center space-y-4">
                                {!isForgotPassword ? (
                                    <>
                                        <button className="text-[var(--color-brand-primary)] hover:underline text-sm font-medium" onClick={() => { setError(null); setIsForgotPassword(true); }}>
                                            ¿Olvidaste tu contraseña?
                                        </button>

                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="text-gray-600 text-sm mb-2">¿No tienes cuenta?</p>
                                            <button
                                                onClick={() => { handleClose(); navigate('/register'); }}
                                                className="text-[var(--color-brand-primary)] font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                                            >
                                                Crear Cuenta <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => { setError(null); setIsForgotPassword(false); }}
                                        className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                                    >
                                        Volver al inicio de sesión
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
