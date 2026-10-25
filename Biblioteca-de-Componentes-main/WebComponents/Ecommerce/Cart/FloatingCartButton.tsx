import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const HIDDEN_PATHS = ['/checkout', '/cart'];

export const FloatingCartButton: React.FC = () => {
    const { setIsCartOpen, cartCount } = useCart();
    const { pathname } = useLocation();

    if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;

    return (
        <AnimatePresence>
            {cartCount > 0 && (
                <div className="fixed z-40 bottom-6 right-6 md:bottom-8 md:left-1/2 md:right-auto md:-translate-x-1/2 flex justify-center items-center pointer-events-none">
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCartOpen(true)}
                        className="pointer-events-auto bg-[var(--color-brand-primary)] text-white shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all flex items-center justify-center p-4 rounded-full md:px-8 md:py-4"
                    >
                        <ShoppingBag className="w-6 h-6 md:w-7 md:h-7 drop-shadow-sm" />

                        <span className="hidden md:inline-block ml-3 font-extrabold text-lg whitespace-nowrap drop-shadow-sm tracking-wide">
                            Ver Carrito
                        </span>

                        {/* Mobile Badge */}
                        <span className="md:hidden absolute -top-2 -right-2 bg-[var(--color-brand-secondary)] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {cartCount}
                        </span>

                        {/* Desktop Badge */}
                        <span className="hidden md:flex ml-3 bg-white text-[var(--color-brand-primary)] text-base font-bold px-3 py-1 rounded-full items-center justify-center shadow-inner min-w-[2.25rem]">
                            {cartCount}
                        </span>
                    </motion.button>
                </div>
            )}
        </AnimatePresence>
    );
};
