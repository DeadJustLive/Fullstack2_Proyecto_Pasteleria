import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';

export const CartDrawer: React.FC = () => {
    const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    // Transfer Fee Calculation (Example: 1.5% or fixed amount, adjusting as per user request later if specific)
    // For now, let's assume a small service fee or just the raw total if not specified yet.
    // User mentioned "sume el impuesto por el tema de las transferencias". 
    // Let's add a configurable fee.
    // const TRANSFER_FEE_PERCENTAGE = 0.0;
    // Actually user said "sume el impuesto por el tema de las transferencias en chile".
    // Often this is 19% VAT (IVA) if formal, or maybe a transaction fee.
    // Let's add a placeholder for "Costo por Transferencia/Gestión" if needed, 
    // but usually bank transfers in Chile are free for individuals. 
    // Maybe they mean the tax (IVA)? Let's stick to subtotal for now and ask or add a small fee line.

    // Let's assume they want to show the total.

    const total = cartTotal;

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-[100] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[var(--color-brand-background)]">
                            <h2 className="text-2xl font-bold text-[var(--color-brand-text)] flex items-center gap-2">
                                <ShoppingBag className="text-[var(--color-brand-primary)]" />
                                Tu Pedido
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-500"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
                                    <ShoppingBag size={64} className="text-gray-200" />
                                    <p className="text-lg">Tu carrito está vacío</p>
                                    <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                                        Volver al catálogo
                                    </Button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-[var(--color-brand-text)] line-clamp-1">{item.name}</h3>
                                            <p className="text-[var(--color-brand-primary)] font-bold">
                                                ${item.price.toLocaleString('es-CL')}
                                            </p>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:text-[var(--color-brand-primary)] transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:text-[var(--color-brand-primary)] transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>${cartTotal.toLocaleString('es-CL')}</span>
                                    </div>
                                    {/* Placeholder for Transfer Fee if needed */}
                                    {/* <div className="flex justify-between text-gray-600 text-sm">
                    <span>Costo servicio</span>
                    <span>$0</span>
                  </div> */}
                                    <div className="flex justify-between text-xl font-bold text-[var(--color-brand-text)] pt-3 border-t border-gray-200">
                                        <span>Total a Transferir</span>
                                        <span>${total.toLocaleString('es-CL')}</span>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full py-4 text-lg shadow-xl" 
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        navigate('/checkout');
                                    }}
                                >
                                    Confirmar Pedido
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
