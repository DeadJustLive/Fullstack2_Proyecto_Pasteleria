import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const FavoritesTab = ({ favorites, toggleFavorite }: any) => {
    return (
        <div className="space-y-6">
            <h2 className="profile-page-title">Mis Favoritos</h2>
            {favorites.length === 0 ? (
                <div className="empty-state-card text-center">
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No tienes productos favoritos guardados</p>
                    <p className="text-gray-400 text-sm mt-1">Presiona el ❤️ en cualquier producto del catálogo</p>
                    <Link to="/" className="inline-block mt-4 text-[var(--color-brand-primary)] font-bold hover:underline">Ir al catálogo</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map((product: any) => (
                        <div key={product.id} className="profile-card flex gap-4 items-center">
                            <Link to={`/product/${product.id}`} className="flex-shrink-0">
                                <img src={product.image || 'https://placehold.co/80x80/e2e8f0/64748b?text=Sin+Imagen'} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link to={`/product/${product.id}`} className="font-bold text-gray-800 hover:text-[var(--color-brand-primary)] transition-colors truncate block">{product.name}</Link>
                                <p className="text-[var(--color-brand-primary)] font-semibold text-sm mt-0.5">${product.price.toLocaleString('es-CL')}</p>
                            </div>
                            <button onClick={() => toggleFavorite(product)} className="p-2 text-[var(--color-brand-primary)] hover:bg-red-50 rounded-full transition-colors flex-shrink-0" title="Quitar de favoritos">
                                <Heart size={18} className="fill-current" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
