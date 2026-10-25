import React from 'react';
import { Trash2 } from 'lucide-react';
import type { CartItem } from '../../context/CartContext';

interface CheckoutOrderSummaryProps {
    items: CartItem[];
    cartTotal: number;
    shippingCost: number;
    usedPoints: number;
    finalTotal: number;
    earnedPoints: number;
    onCancel: () => void;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
    items,
    cartTotal,
    shippingCost,
    usedPoints,
    finalTotal,
    earnedPoints,
    onCancel
}) => {
    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-[var(--color-brand-text)] mb-6 pb-4 border-b border-gray-100">
                Resumen del Pedido
            </h3>

            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 pt-3">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                        <div className="relative">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                            <span className="absolute -top-2 -right-2 bg-gray-100 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                                {item.quantity}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">${item.price.toLocaleString('es-CL')}</p>
                        </div>
                        <p className="font-bold text-sm">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${cartTotal.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>${shippingCost.toLocaleString('es-CL')}</span>
                </div>
                {usedPoints > 0 && (
                    <div className="flex justify-between text-amber-600 font-bold">
                        <span>Puntos Canjeados</span>
                        <span>-${usedPoints.toLocaleString('es-CL')}</span>
                    </div>
                )}
                <div className="flex justify-between text-2xl font-bold text-[var(--color-brand-text)] pt-4 border-t border-gray-100">
                    <span>Total</span>
                    <span>${finalTotal.toLocaleString('es-CL')}</span>
                </div>
                {earnedPoints > 0 && (
                    <div className="text-right text-sm text-amber-600 font-medium mt-1">
                        + Ganarás {earnedPoints} puntos con esta compra
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                    onClick={onCancel}
                    className="w-full py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} />
                    Cancelar Compra
                </button>
            </div>
        </div>
    );
};
