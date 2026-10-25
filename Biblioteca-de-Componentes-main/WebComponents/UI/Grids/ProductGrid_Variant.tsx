import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from '../ui/ProductSkeleton';

type SortOption = 'popular' | 'price-asc' | 'price-desc';
type Category = 'todos' | 'alfajores' | 'chocolates' | 'packs' | 'otros';

export const ProductGrid: React.FC = () => {
    const { products, loading, error } = useProducts();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category>('todos');
    const [sortBy, setSortBy] = useState<SortOption>('popular');

    const categories: { id: Category; label: string }[] = [
        { id: 'todos', label: 'Todos' },
        { id: 'packs', label: 'Packs Temáticos' },
        { id: 'alfajores', label: 'Alfajores' },
        { id: 'chocolates', label: 'Chocolates' },
    ];

    const filteredProducts = useMemo(() => {
        return products
            .filter((product) => {
                // Filter by Category
                if (selectedCategory !== 'todos' && product.category !== selectedCategory) {
                    return false;
                }
                // Filter by Search
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    return (
                        product.name.toLowerCase().includes(query) ||
                        product.description.toLowerCase().includes(query)
                    );
                }
                return true;
            })
            .sort((a, b) => {
                // Sort Logic
                switch (sortBy) {
                    case 'price-asc':
                        return a.price - b.price;
                    case 'price-desc':
                        return b.price - a.price;
                    case 'popular':
                    default:
                        // For now, "Popular" puts "New" items first, then by ID
                        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
                }
            });
    }, [searchQuery, selectedCategory, sortBy, products]);

    if (loading) {
        return (
            <section id="productos" className="py-20 bg-white min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[var(--color-brand-text)] mb-4">
                            Nuestros Favoritos
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Explora nuestra colección de dulces artesanales.
                        </p>
                    </div>
                    <div className="bg-gray-50 h-[88px] w-full max-w-6xl mx-auto rounded-2xl shadow-sm mb-8 md:mb-12 border border-gray-100 animate-pulse" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }
    if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;

    return (
        <section id="productos" className="py-20 bg-white min-h-screen">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-[var(--color-brand-text)] mb-4">
                        Nuestros Favoritos
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Explora nuestra colección de dulces artesanales.
                    </p>
                </div>

                {/* Controls Bar */}
                <div className="bg-gray-50 p-4 rounded-2xl shadow-sm mb-8 md:mb-12 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                        {/* Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar alfajores, chocolates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none transition-all"
                            />
                        </div>

                        {/* Categories (Desktop) */}
                        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat.id
                                        ? 'bg-[var(--color-brand-primary)] text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-48">
                                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[var(--color-brand-primary)] outline-none appearance-none cursor-pointer text-sm font-medium text-gray-700"
                                >
                                    <option value="popular">Más Populares</option>
                                    <option value="price-asc">Menor Precio</option>
                                    <option value="price-desc">Mayor Precio</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Categories (Mobile) */}
                    <div className="md:hidden mt-4 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${selectedCategory === cat.id
                                    ? 'bg-[var(--color-brand-primary)] text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Results Grid */}
                <div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
                >
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900">No encontramos resultados</h3>
                            <p className="text-gray-500 mt-2">Intenta con otra búsqueda o categoría.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('todos'); }}
                                className="mt-4 text-[var(--color-brand-primary)] font-medium hover:underline"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
