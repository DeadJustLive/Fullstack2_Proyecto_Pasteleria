import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../data/products';

// [PETICIÓN DE SIMPLIFICACIÓN]: Modularizar la lógica del carrito.
// REFACTORIZACIÓN SUGERIDA: 
// 1. Extraer 'checkoutData' a su propio Context o a un estado local en la página de Checkout.
// 2. Mover la persistencia en localStorage a un custom hook 'useLocalStorageCart'.
// 3. Separar los tipos a 'src/types/cart.ts'.

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    cartTotal: number;
    cartCount: number;
    checkoutData: {
        name: string;
        email: string;
        phone: string;
        rut: string;
        region: string;
        commune: string;
        address: string;
        message: string;
        deliveryMethod: 'pickup' | 'starken-branch' | 'starken-home';
    };
    setCheckoutData: React.Dispatch<React.SetStateAction<{
        name: string;
        email: string;
        phone: string;
        rut: string;
        region: string;
        commune: string;
        address: string;
        message: string;
        deliveryMethod: 'pickup' | 'starken-branch' | 'starken-home';
    }>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from local storage');
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.id === product.id);
            if (existingItem) {
                return currentItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + (quantity || 1) }
                        : item
                );
            }
            return [...currentItems, { ...product, quantity: quantity || 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setItems(currentItems => currentItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setItems(currentItems =>
            currentItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const [checkoutData, setCheckoutData] = useState({
        name: '',
        email: '',
        phone: '',
        rut: '',
        region: '',
        commune: '',
        address: '',
        message: '',
        deliveryMethod: 'pickup' as 'pickup' | 'starken-branch' | 'starken-home'
    });

    const cartTotal = items.reduce((total, item) => {
        let finalPrice = item.price;
        if (item.bulk_discount_tiers && item.bulk_discount_tiers.length > 0) {
            // Find the highest applicable discount tier
            const applicableTiers = item.bulk_discount_tiers
                .filter(t => item.quantity >= t.min_qty)
                .sort((a, b) => b.min_qty - a.min_qty);
            
            if (applicableTiers.length > 0) {
                const discount = applicableTiers[0].discount_percentage;
                finalPrice = Math.round(item.price * (1 - discount / 100));
            }
        }
        return total + (finalPrice * item.quantity);
    }, 0);
    const cartCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            cartTotal,
            cartCount,
            checkoutData,
            setCheckoutData
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
