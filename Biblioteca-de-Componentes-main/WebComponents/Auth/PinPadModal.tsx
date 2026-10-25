// @use(kind, props, limit, deps, state)
// @kind(component)
// @props(onSuccess: () => void, onCancel: () => void, title?: string)
// @limit(lines: 120, functions: 3, params: 1)
// @deps(@external: [react, lucide-react], @internal: [./ui/dialog])
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Lock, Delete } from 'lucide-react';

interface PinPadModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'setup' | 'verify' | 'verify_theme';
    onSuccess: (pin: string) => void;
    /** If provided in verify mode, the modal will validate the PIN internally and show an error if wrong */
    validPin?: string;
}

export function PinPadModal({ isOpen, onClose, mode, onSuccess, validPin }: PinPadModalProps) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState<'enter' | 'confirm'>(mode === 'setup' ? 'enter' : 'enter');
    const [error, setError] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setPin('');
            setConfirmPin('');
            setStep('enter');
            setError(false);
        }
    }, [isOpen, mode]);

    const handleKeyPress = (num: string) => {
        if (error) setError(false);

        if (step === 'enter') {
            if (pin.length < 6) {
                const newPin = pin + num;
                setPin(newPin);

                if (newPin.length === 6) {
                    if (mode === 'setup') {
                        setTimeout(() => setStep('confirm'), 300);
                    } else if (validPin) {
                        // Validate internally against secret PIN
                        if (newPin === validPin) {
                            setTimeout(() => onSuccess(newPin), 200);
                        } else {
                            setError(true);
                            setTimeout(() => {
                                setPin('');
                                setError(false);
                            }, 1000);
                        }
                    } else {
                        // No validPin provided — pass to parent for validation
                        setTimeout(() => onSuccess(newPin), 200);
                    }
                }
            }
        } else {
            // Confirm step (setup mode only)
            if (confirmPin.length < 6) {
                const newConfirm = confirmPin + num;
                setConfirmPin(newConfirm);

                if (newConfirm.length === 6) {
                    if (newConfirm === pin) {
                        setTimeout(() => onSuccess(pin), 200);
                    } else {
                        setError(true);
                        setTimeout(() => {
                            setConfirmPin('');
                            setPin('');
                            setStep('enter');
                            setError(false);
                        }, 1000);
                    }
                }
            }
        }
    };

    const handleDelete = () => {
        if (error) return;

        if (step === 'enter') {
            setPin(prev => prev.slice(0, -1));
        } else {
            setConfirmPin(prev => prev.slice(0, -1));
        }
    };

    const currentLength = step === 'enter' ? pin.length : confirmPin.length;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent hideCloseButton className="ppm-content">
                <div className="ppm-wrapper">
                    {/* Header */}
                    <div className="ppm-header">
                        <button
                            onClick={onClose}
                            className="ppm-close-btn"
                            aria-label="Cerrar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        <div className="ppm-icon-bg">
                            <Lock className="ppm-icon" />
                        </div>
                        <DialogTitle className="ppm-title">
                            {mode === 'setup'
                                ? (step === 'enter' ? 'Crear PIN de Acceso' : 'Confirma tu PIN')
                                : (mode === 'verify_theme' ? 'Autorización Requerida' : 'Ingresa tu PIN')}
                        </DialogTitle>
                        <p className="ppm-subtitle">
                            {mode === 'setup'
                                ? (step === 'enter' ? 'Ingresa 6 dígitos para proteger el modo Administrador' : 'Vuelve a ingresar los 6 dígitos')
                                : (mode === 'verify_theme' ? 'Ingresa el PIN para cambiar la apariencia del sitio Web.' : 'Ingresa el PIN de 6 dígitos para desbloquear el modo Administrador')}
                        </p>
                    </div>

                    {/* Dots Indicator */}
                    <div className="ppm-indicator-area">
                        <div className={`ppm-dots-container ${error ? 'ppm-dots-container--shake' : ''}`}>
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`ppm-dot ${i < currentLength
                                        ? (error ? 'ppm-dot--error' : 'ppm-dot--filled')
                                        : 'ppm-dot--empty'
                                        }`}
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="ppm-error-text">
                                {mode === 'setup' ? 'Los PIN no coinciden. Intenta de nuevo.' : 'PIN incorrecto. Intenta de nuevo.'}
                            </p>
                        )}
                    </div>

                    {/* Keypad */}
                    <div className="ppm-keypad-area">
                        <div className="ppm-keypad-grid">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleKeyPress(num.toString())}
                                    className="ppm-key"
                                >
                                    {num}
                                </button>
                            ))}
                            <div /> {/* Empty space for bottom-left */}
                            <button
                                onClick={() => handleKeyPress('0')}
                                className="ppm-key"
                            >
                                0
                            </button>
                            <button
                                onClick={handleDelete}
                                className="ppm-key-delete"
                            >
                                <Delete className="w-8 h-8" />
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
