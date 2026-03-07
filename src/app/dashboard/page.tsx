"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronLeft, Search, User, Sparkles } from 'lucide-react';
import { useCart, Product, CartItem } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
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
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserData(session.user);
            }

            const { data, error } = await supabase.from('products').select('*');
            if (!error && data) {
                const mappedProducts: Product[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    category: p.category,
                    image: p.image_url || p.image || '/logo.png',
                    inStock: p.stock > 0,
                    isCOD: p.is_cod,
                    description: p.description
                }));
                setProducts(mappedProducts);
            } else {
                setProducts(productsData as Product[]);
            }
            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    // Combine database categories and explicitly requested 'Roll-on'
    const dynamicCategories = Array.from(new Set(products.map((p: Product) => p.category)));
    const categories = ["All", ...new Set([...dynamicCategories, "Roll-on", "Fragrance", "Oil"])];

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
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#3E2723]">Curated Delivery</span>
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
                        Your personalized fragrance collection awaits. Discover new arrivals and secure your favorite scents instantly based on your preferences.
                    </p>
                </div>

                {/* Categories Navigation */}
                <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-6 mb-8 scroll-smooth">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex-shrink-0 px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
                                activeCategory === cat
                                ? 'bg-[#3E2723] text-[#D4AF37] shadow-xl shadow-[#3E2723]/20 scale-105 border-transparent'
                                : 'bg-white text-zinc-400 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Dynamic Product Grid */}
                <div className="animate-in">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-[32px] h-[350px] w-full p-6 border border-zinc-100 shadow-sm animate-pulse flex flex-col">
                                    <div className="aspect-square bg-zinc-50 rounded-2xl mb-6 flex-1"></div>
                                    <div className="h-4 bg-zinc-100 rounded w-1/2 mb-3"></div>
                                    <div className="h-6 bg-zinc-100 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {filteredProducts.length === 0 ? (
                                <div className="py-24 bg-white rounded-[40px] border border-zinc-100 border-dashed text-center flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                                        <Search className="w-8 h-8 text-zinc-300" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-black mb-2 text-zinc-900">No {activeCategory} Scents Available</h3>
                                    <p className="text-zinc-500 font-medium text-sm max-w-md">Our collection for this category is currently empty. Check back soon or explore other curated categories.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                                    {filteredProducts.map((p: Product) => (
                                        <Link href={`/product/${p.id}`} key={p.id} className="bg-white rounded-[24px] md:rounded-[32px] p-3 md:p-6 border border-zinc-100 hover:border-[#D4AF37] hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)] transition-all duration-500 group flex flex-col h-full active:scale-95">
                                            <div className="aspect-square bg-zinc-50 rounded-xl md:rounded-2xl mb-5 flex items-center justify-center p-4 relative overflow-hidden">
                                                <img 
                                                    src={p.image} 
                                                    alt={p.name} 
                                                    className={`max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-700 ${!p.inStock ? 'opacity-50 grayscale' : ''}`} 
                                                    loading="lazy"
                                                />
                                                {p.isCOD && (
                                                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-zinc-200 text-zinc-600 z-10 shadow-sm">COD</span>
                                                )}
                                                {!p.inStock && (
                                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                                                        <span className="text-[10px] tracking-widest uppercase font-black text-white bg-red-600 px-4 py-2 rounded-full shadow-2xl">Sold Out</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#D4AF37] mb-1">{p.category}</span>
                                                <h3 className="text-xs md:text-base font-serif font-black line-clamp-2 leading-tight text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>{p.name}</h3>
                                                <div className="mt-auto pt-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Price</p>
                                                        <p className={`text-sm md:text-lg font-black ${!p.inStock ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>₦{p.price?.toLocaleString()}</p>
                                                    </div>
                                                    <button
                                                        disabled={!p.inStock}
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(p); }}
                                                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${p.inStock ? 'bg-zinc-900 text-white hover:bg-[#D4AF37] shadow-xl hover:-translate-y-1' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'}`}
                                                    >
                                                        <ShoppingBag className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
