import React from 'react';
import { MapPin, CheckCircle } from 'lucide-react';

interface AddressSelectorProps {
    isAuthenticated: boolean;
    userAddresses: any[];
    formData: {
        region: string;
        commune: string;
        address: string;
        phone: string;
    };
    availableRegions: string[];
    availableCommunes: string[];
    onChange: (data: any) => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
    isAuthenticated,
    userAddresses,
    formData,
    availableRegions,
    availableCommunes,
    onChange
}) => {
    return (
        <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Saved Addresses Selector */}
            {isAuthenticated && userAddresses && userAddresses.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-3 text-[var(--color-brand-secondary)] mb-4">
                        <MapPin size={24} />
                        <h3 className="text-lg font-bold">Mis Direcciones</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {userAddresses.map((addr) => (
                            <div
                                key={addr.id}
                                onClick={() => {
                                    onChange({
                                        region: addr.region,
                                        commune: addr.commune,
                                        address: addr.address
                                    });
                                }}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${formData.address === addr.address
                                    ? 'border-[var(--color-brand-primary)] bg-red-50'
                                    : 'border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div>
                                    <div className="font-bold text-gray-800">{addr.title}</div>
                                    <div className="text-sm text-gray-600">{addr.address}, {addr.commune}</div>
                                </div>
                                {formData.address === addr.address && (
                                    <CheckCircle className="text-[var(--color-brand-primary)]" size={20} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">O ingresa una nueva</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 text-[var(--color-brand-secondary)] mb-4">
                <MapPin size={24} />
                <h3 className="text-lg font-bold">Dirección de Envío</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Región</label>
                    <select
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none bg-white"
                        value={formData.region}
                        onChange={e => onChange({ region: e.target.value, commune: '' })}
                        required
                    >
                        <option value="">Selecciona una región</option>
                        {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Comuna</label>
                    <select
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                        value={formData.commune}
                        onChange={e => onChange({ commune: e.target.value })}
                        required
                        disabled={!formData.region}
                    >
                        <option value="">Selecciona una comuna</option>
                        {availableCommunes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Calle y Número</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none"
                        value={formData.address}
                        onChange={e => onChange({ address: e.target.value })}
                    />
                </div>

                {!formData.phone && (
                    <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-medium text-gray-700">Teléfono de Contacto</label>
                        <input
                            required
                            type="tel"
                            placeholder="+56 9..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-brand-primary)] outline-none"
                            value={formData.phone}
                            onChange={e => onChange({ phone: e.target.value })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
