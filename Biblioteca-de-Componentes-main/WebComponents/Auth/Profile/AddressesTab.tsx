import React, { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

export const AddressesTab = ({ user, addAddress, updateAddress, deleteAddress }: any) => {
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressForm, setAddressForm] = useState({ title: '', region: '', commune: '', address: '' });

    const openEditAddress = (addr: any) => {
        setAddressForm({ title: addr.title, region: addr.region, commune: addr.commune, address: addr.address });
        setEditingAddressId(addr.id);
        setIsAddressModalOpen(true);
    };

    const openNewAddress = () => {
        setAddressForm({ title: '', region: '', commune: '', address: '' });
        setEditingAddressId(null);
        setIsAddressModalOpen(true);
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAddressId) {
                await updateAddress(editingAddressId, addressForm);
                toast.success('Dirección actualizada con éxito');
            } else {
                await addAddress(addressForm);
                toast.success('Dirección agregada con éxito');
            }
            setIsAddressModalOpen(false);
            setEditingAddressId(null);
            setAddressForm({ title: '', region: '', commune: '', address: '' });
        } catch (error) {
            toast.error('Error al guardar dirección');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="profile-page-title">Mis Direcciones</h2>
                <button onClick={openNewAddress} className="flex items-center gap-2 text-[var(--color-brand-primary)] font-bold hover:underline">
                    <Plus size={20} /> Añadir dirección
                </button>
            </div>

            <div className="space-y-4">
                {user.addresses?.map((addr: any) => (
                    <div key={addr.id} className="profile-card flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-gray-800">{addr.title}</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{addr.region}</span>
                            </div>
                            <p className="text-gray-600">{addr.address}</p>
                            <p className="text-gray-500 text-sm">{addr.commune}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => openEditAddress(addr)} className="text-[var(--color-brand-primary)] font-medium hover:underline text-sm">Modificar</button>
                            <button onClick={() => deleteAddress(addr.id)} className="text-red-500 font-medium hover:underline text-sm">Eliminar</button>
                        </div>
                    </div>
                ))}
                {(!user.addresses || user.addresses.length === 0) && (
                    <div className="empty-state-card text-center">
                        <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No tienes direcciones guardadas</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isAddressModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsAddressModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
                            <h3 className="text-xl font-bold mb-6">{editingAddressId ? 'Modificar Dirección' : 'Nueva Dirección'}</h3>
                            <form onSubmit={handleAddressSubmit} className="space-y-4">
                                <div>
                                    <label className="form-label">Nombre (ej: Casa, Oficina)</label>
                                    <input type="text" required className="form-input" value={addressForm.title} onChange={e => setAddressForm({ ...addressForm, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Región</label>
                                        <input type="text" required className="form-input" value={addressForm.region} onChange={e => setAddressForm({ ...addressForm, region: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="form-label">Comuna</label>
                                        <input type="text" required className="form-input" value={addressForm.commune} onChange={e => setAddressForm({ ...addressForm, commune: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Dirección</label>
                                    <input type="text" required className="form-input" value={addressForm.address} onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} />
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button type="button" onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">Cancelar</button>
                                    <Button className="flex-1 py-3">Guardar</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
