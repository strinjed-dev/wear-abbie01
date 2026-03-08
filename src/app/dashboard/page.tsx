"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronLeft, Search, User, Truck } from 'lucide-react';
import { useCart, Product, CartItem } from '@/context/CartContext';
import { supabase, getSafeSession } from '@/lib/supabase';
import MemberNavbar from '@/components/layout/MemberNavbar';
import productsData from '@/data/products.json';
import Link from 'next/link';

export default function UserShoppingDashboard() {
    const { cart, addToCart } = useCart();
    const [userData, setUserData] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { session } } = await getSafeSession();
            if (session?.user) {
                setUserData(session.user);
            }

            const { data, error } = await supabase.from('products').select('*');
            if (!error && data) {
                const mappedProducts: Product[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    original_price: p.original_price || null,
                    category: p.category,
                    image: p.image_url || p.image || '/logo.png',
                    inStock: p.stock > 0,
                    stock: p.stock,
                    isCOD: p.is_cod,
                    description: p.description,
                    size: p.size || '',
                    type: p.type || '',
                }));
                setProducts(mappedProducts);
            } else {
                setProducts(productsData as Product[]);
            }
            setLoading(false);
        };

        fetchDashboardData();

        // --- Real-time Products Synchronization ---
        const channel = supabase
            .channel('realtime-dashboard-products')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        const newProduct: Product = {
                            id: payload.new.id,
                            name: payload.new.name,
                            price: payload.new.price,
                            original_price: payload.new.original_price || null,
                            category: payload.new.category,
                            image: payload.new.image_url || payload.new.image || '/logo.png',
                            inStock: payload.new.stock > 0,
                            stock: payload.new.stock,
                            isCOD: payload.new.is_cod,
                            description: payload.new.description,
                            size: payload.new.size || '',
                            type: payload.new.type || '',
                        };
                        setProducts((current: Product[]) => [newProduct, ...current]);
                    } else if (payload.eventType === 'UPDATE') {
                        setProducts((current: Product[]) =>
                            current.map((p: Product) => p.id === payload.new.id ? {
                                ...p,
                                name: payload.new.name,
                                price: payload.new.price,
                                original_price: payload.new.original_price || null,
                                category: payload.new.category,
                                image: payload.new.image_url || payload.new.image || p.image,
                                inStock: payload.new.stock > 0,
                                stock: payload.new.stock,
                                isCOD: payload.new.is_cod,
                                description: payload.new.description,
                                size: payload.new.size || '',
                                type: payload.new.type || '',
                            } : p)
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setProducts((current: Product[]) => current.filter((p: Product) => p.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Only show categories that actually have products
    const dynamicCategories = Array.from(new Set(products.map((p: Product) => p.category))).filter(Boolean);
    const categories = ["All", ...dynamicCategories];

    const filteredProducts = activeCategory === "All"
        ? products
        : products.filter((p: Product) => p.category === activeCategory);

    return (
        <div className="min-h-screen bg-[#fafafa] pb-20 overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
                body { font-family: 'Outfit', sans-serif; }
                .font-serif { font-family: 'Playfair Display', serif; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            <MemberNavbar />

            <div className="max-w-[1400px] mx-auto pt-24 md:pt-32 px-4 md:px-10">

                {/* Dashboard Back & Header Row */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-white group-hover:border-[#D4AF37] transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Go Back</span>
                    </button>

                    <div className="flex bg-white px-6 py-3 rounded-full border border-zinc-100 shadow-sm items-center gap-3">
                        <Truck className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#3E2723]">Free Delivery Available</span>
                    </div>
                </div>

                {/* Greeting Section */}
                <div className="bg-[#121212] rounded-[32px] md:rounded-[48px] p-8 md:p-16 relative overflow-hidden shadow-2xl mb-12 flex flex-col items-center text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3E2723]/20 rounded-full blur-[80px]"></div>

                    <h1 className="text-4xl md:text-7xl font-serif font-black text-white relative z-10 mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Welcome back, <span className="text-[#D4AF37] italic font-light">{userData?.user_metadata?.full_name?.split(' ')[0] || 'Member'}</span>.
                    </h1>
                    <p className="text-zinc-400 font-medium text-sm md:text-lg max-w-xl relative z-10 mx-auto">
                        Browse our collection and find your signature scent. New arrivals added weekly.
                    </p>
                </div>

                {/* Jumia-Style Category Rows */}
                <div className="animate-in space-y-16">
                    {loading ? (
                        <div className="space-y-12">
                            {[1, 2].map((catRow) => (
                                <div key={catRow} className="w-full">
                                    <h3 className="text-2xl font-serif font-black mb-6 bg-zinc-200 text-transparent rounded w-48 animate-pulse">Category Loading</h3>
                                    <div className="flex overflow-x-auto gap-4 md:gap-6 no-scrollbar pb-6">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex-shrink-0 w-[240px] md:w-[280px] bg-white rounded-[24px] h-[350px] p-6 border border-zinc-100 shadow-sm animate-pulse flex flex-col">
                                                <div className="aspect-square bg-zinc-50 rounded-2xl mb-6 flex-1"></div>
                                                <div className="h-4 bg-zinc-100 rounded w-1/2 mb-3"></div>
                                                <div className="h-6 bg-zinc-100 rounded w-3/4"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {categories.filter(c => c !== "All").map(category => {
                                const categoryProducts = products.filter(p => p.category === category);
                                if (categoryProducts.length === 0) return null;

                                return (
                                    <div key={category} className="w-full relative">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-2xl md:text-3xl font-serif font-black text-zinc-900 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                                {category}
                                            </h3>
                                            <a href="/shop" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#D4AF37] transition-colors">
                                                View All
                                            </a>
                                        </div>

                                        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 no-scrollbar scroll-smooth snap-x snap-mandatory px-2 -mx-2">
                                            {categoryProducts.map((p: Product) => {
                                                // Real discount using mapped original_price
                                                const origPrice = p.original_price ? p.original_price : null;
                                                const hasDiscount = origPrice !== null && origPrice > (p.price || 0);
                                                const discountPercent = hasDiscount ? Math.round(((origPrice - (p.price || 0)) / origPrice) * 100) : 0;

                                                return (
                                                    <Link href={`/product/${p.id}`} key={p.id} className="snap-start flex-shrink-0 w-[220px] md:w-[260px] bg-white rounded-[24px] p-4 border border-zinc-100 hover:border-[#D4AF37] hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] transition-all duration-500 group flex flex-col active:scale-95">
                                                        <div className="aspect-square bg-zinc-50 rounded-xl mb-4 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-zinc-100/50 transition-colors">
                                                            <img
                                                                src={p.image}
                                                                alt={p.name}
                                                                className={`max-w-full max-h-full object-contain transform group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-700 ${!p.inStock ? 'opacity-50 grayscale' : ''}`}
                                                                loading="lazy"
                                                            />

                                                            {/* Discount Badge */}
                                                            {p.inStock && hasDiscount && (
                                                                <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
                                                                    -{discountPercent}% OFF
                                                                </span>
                                                            )}

                                                            {!p.inStock && (
                                                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                                                                    <span className="text-[10px] tracking-widest uppercase font-black text-white bg-red-600 px-4 py-2 rounded-full shadow-2xl">Sold Out</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 flex flex-col">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">{p.category}</span>
                                                                {p.size && <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded-md">{p.size}</span>}
                                                            </div>
                                                            <h3 className="text-sm font-black line-clamp-2 leading-tight text-zinc-900 group-hover:text-[#D4AF37] transition-colors" style={{ fontFamily: 'var(--font-playfair), serif' }}>{p.name}</h3>

                                                            <div className="mt-auto pt-4 flex flex-col">
                                                                <div className="flex items-end gap-2 mb-1">
                                                                    <p className={`text-base font-black ${!p.inStock ? 'text-zinc-400' : 'text-zinc-900'}`}>₦{p.price?.toLocaleString()}</p>
                                                                    {p.inStock && hasDiscount && origPrice && (
                                                                        <p className="text-[10px] font-bold text-zinc-400 line-through mb-[3px]">₦{origPrice.toLocaleString()}</p>
                                                                    )}
                                                                </div>

                                                                <div
                                                                    role="button"
                                                                    onClick={(e: React.MouseEvent) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        if (p.inStock) addToCart(p);
                                                                    }}
                                                                    className={`w-full py-3 mt-3 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-widest transition-all ${p.inStock ? 'bg-[#121212] text-white hover:bg-[#D4AF37] shadow-xl hover:-translate-y-0.5 cursor-pointer' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
                                                                >
                                                                    <ShoppingBag className="w-3 h-3" /> Add to Boutique Bag
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
