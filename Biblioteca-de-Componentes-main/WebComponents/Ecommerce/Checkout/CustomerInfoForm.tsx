import React, { useState } from 'react';
import { User, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface CustomerInfoFormProps {
    formData: {
        name: string;
        rut: string;
        email: string;
        phone: string;
    };
    onChange: (data: any) => void;
    onNext: () => void;
}

// ── Validators ─────────────────────────────────────────────────────────────

/** Validates Chilean RUT verifier digit (dígito verificador). */
function validateRut(rut: string): boolean {
    const cleaned = rut.replace(/\./g, '').toUpperCase();
    const parts = cleaned.split('-');
    if (parts.length !== 2) return false;
    const body = parts[0];
    const dv = parts[1];
    if (!/^\d{7,8}$/.test(body) || !/^[\dK]$/.test(dv)) return false;

    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const remainder = 11 - (sum % 11);
    const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
    return dv === expected;
}

/** Auto-formats RUT as user types: 123456789 → 12.345.678-9 */
function formatRut(value: string): string {
    const cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleaned.length <= 1) return cleaned;
    const dv = cleaned.slice(-1);
    const body = cleaned.slice(0, -1);
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted}-${dv}`;
}

/** Validates Chilean mobile phone: 9XXXXXXXX, +569XXXXXXXX or 569XXXXXXXX. */
function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s().+-]/g, '');
    return /^(56)?9\d{8}$/.test(cleaned);
}

/** Basic RFC-compliant email check. */
function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Name must have at least first + last name (min 5 chars with a space). */
function validateName(name: string): boolean {
    const t = name.trim();
    return t.length >= 5 && /\s/.test(t);
}

// ── Component ──────────────────────────────────────────────────────────────

const INPUT_BASE = 'w-full px-4 py-3 rounded-xl border outline-none transition-colors focus:ring-2 focus:ring-[var(--color-brand-primary)]';
const INPUT_OK   = 'border-gray-200';
const INPUT_ERR  = 'border-red-400 bg-red-50';

export const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({ formData, onChange, onNext }) => {
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const errors: Record<string, string> = {
        name:  !validateName(formData.name)   ? 'Ingresa nombre y apellido (ej: María González)' : '',
        rut:   !validateRut(formData.rut)     ? 'RUT inválido — formato: 12.345.678-9'           : '',
        email: !validateEmail(formData.email) ? 'Email inválido'                                  : '',
        phone: !validatePhone(formData.phone) ? 'Teléfono inválido — ej: +56 9 1234 5678'        : '',
    };

    const isFormValid = Object.values(errors).every(e => !e);

    const blur = (field: string) => setTouched(p => ({ ...p, [field]: true }));

    const handleNext = () => {
        setTouched({ name: true, rut: true, email: true, phone: true });
        if (isFormValid) onNext();
    };

    const field = (key: string) =>
        touched[key] && errors[key] ? INPUT_ERR : INPUT_OK;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 text-[var(--color-brand-secondary)] mb-4">
                <User size={24} />
                <h2 className="text-xl font-bold">Información Personal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                        Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Ej: María González"
                        className={`${INPUT_BASE} ${field('name')}`}
                        value={formData.name}
                        onChange={e => onChange({ name: e.target.value })}
                        onBlur={() => blur('name')}
                    />
                    {touched.name && errors.name && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle size={12} /> {errors.name}
                        </p>
                    )}
                </div>

                {/* RUT */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                        RUT <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="12.345.678-9"
                        maxLength={12}
                        className={`${INPUT_BASE} ${field('rut')}`}
                        value={formData.rut}
                        onChange={e => onChange({ rut: formatRut(e.target.value) })}
                        onBlur={() => blur('rut')}
                    />
                    {touched.rut && errors.rut && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle size={12} /> {errors.rut}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        placeholder="ejemplo@correo.cl"
                        className={`${INPUT_BASE} ${field('email')}`}
                        value={formData.email}
                        onChange={e => onChange({ email: e.target.value })}
                        onBlur={() => blur('email')}
                    />
                    {touched.email && errors.email && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle size={12} /> {errors.email}
                        </p>
                    )}
                </div>

                {/* Teléfono */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                        Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        placeholder="+56 9 1234 5678"
                        className={`${INPUT_BASE} ${field('phone')}`}
                        value={formData.phone}
                        onChange={e => onChange({ phone: e.target.value })}
                        onBlur={() => blur('phone')}
                    />
                    {touched.phone && errors.phone && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle size={12} /> {errors.phone}
                        </p>
                    )}
                    <p className="text-xs text-gray-400">Necesario para coordinar tu entrega.</p>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button className="px-8 py-3 text-lg" onClick={handleNext}>
                    Continuar
                </Button>
            </div>
        </div>
    );
};
