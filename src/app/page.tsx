"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, ShieldCheck, Truck, CreditCard, ArrowRight, Sparkles, X, Plus, Minus, Trash2, SlidersHorizontal, BookOpen, ChevronLeft } from 'lucide-react';
import productsData from '@/data/products.json';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import MemberNavbar from '@/components/layout/MemberNavbar';


// --- Types ---
interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    inStock: boolean;
    isCOD?: boolean;
    description?: string;
}

interface CartItem extends Product {
    quantity: number;
}

// --- Monolithic Shop Page Component ---
export default function Shop() {
    const { cart, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, searchQuery, setSearchQuery } = useCart();
    const [category, setCategory] = useState("All");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkAuth();

        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.error("FULL SUPABASE ERROR DETAILS:", {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                }, error);
                setProducts(productsData as Product[]);
                setLoading(false);
                return;
            }

            console.log("Products loaded:", data);

            if (data && data.length > 0) {
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

        fetchProducts();

        // --- Real-time Products Synchronization ---
        const channel = supabase
            .channel('realtime-products')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'products' },
                (payload: any) => {
                    setProducts((current: Product[]) =>
                        current.map((p: Product) => p.id === payload.new.id ? {
                            ...p,
                            inStock: payload.new.in_stock ?? payload.new.inStock,
                            price: payload.new.price
                        } : p)
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const categories = ["All", ...Array.from(new Set(products.map((p: Product) => p.category)))];

    const cartCount = cart.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);

    const filtered = products.filter((p: Product) => {
        const matchesCategory = category === "All" || p.category === category;
        const q = (searchQuery || "").toLowerCase().trim();
        if (!q) return matchesCategory;

        const nameMatch = (p.name || "").toLowerCase().includes(q);
        const catMatch = (p.category || "").toLowerCase().includes(q);
        const descMatch = (p.description || "").toLowerCase().includes(q);

        return matchesCategory && (nameMatch || catMatch || descMatch);
    });

    return (
        <div className="min-h-screen flex flex-col bg-white text-zinc-900 overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                
                :root {
                    --font-outfit: 'Outfit', sans-serif;
                    --font-playfair: 'Playfair Display', serif;
                    --gold: #D4AF37;
                    --brown: #3E2723;
                }

                body {
                    font-family: var(--font-outfit);
                }

                .font-serif {
                    font-family: var(--font-playfair);
                }

                .container {
                    width: 100%;
                    max-width: 1400px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
            `}</style>

            {/* Top Banner */}
            <div className="bg-black text-white text-[9px] md:text-xs py-3 md:py-4 text-center tracking-[0.3em] md:tracking-[0.4em] font-black uppercase">
                <span className="text-[#D4AF37]">★</span> Smelling nice is our priority • <span className="underline decoration-[#D4AF37] underline-offset-4">Secure Checkout</span> <span className="hidden md:inline">• Nationwide Logistics</span> <span className="text-[#D4AF37]">★</span>
            </div>

            {/* Premium Unified Navbar */}
            <MemberNavbar />

            {/* Spacer for fixed MemberNavbar or multi-row standard Nav */}
            <div className={isLoggedIn ? "h-20 md:h-24" : "h-0 lg:h-0"}></div>


            <main className="flex-grow py-12 md:py-20 bg-white">
                <div className="container mx-auto px-4">
                    {/* Shop Header */}
                    <header className="mb-12 md:mb-24 text-center">
                        <div className="inline-flex items-center gap-2 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.4em] mb-6">
                            <Sparkles className="w-3 h-3" /> The Boutique Selection
                        </div>
                        <h1 className="text-4xl md:text-8xl font-serif font-black mb-8 md:mb-10 tracking-tighter text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>Wear Abbie <span className="italic font-light text-[#D4AF37]">Collections.</span></h1>

                        <div className="flex flex-col items-center gap-8 md:gap-10">
                            <p className="max-w-xl text-zinc-400 font-medium text-sm md:text-lg leading-relaxed px-4">Refined selections for the discerning individual. Discover your signature scent from our olfactory catalog.</p>

                            <div className="flex items-center gap-3 md:gap-4 bg-zinc-50 p-2 rounded-full border border-zinc-100 shadow-sm overflow-x-auto max-w-full no-scrollbar px-4 md:px-6 py-2 md:py-3">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${category === cat ? "bg-[#3E2723] text-white shadow-xl" : "text-zinc-400 hover:text-zinc-900"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </header>

                    {/* Stats/Filters Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 px-6 py-5 bg-zinc-50 rounded-[24px] md:rounded-[30px] border border-zinc-100 gap-4">
                        <div className="flex items-center gap-3">
                            <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Viewing: <span className="text-zinc-900">{category}</span></span>
                        </div>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">{filtered.length} Scents Found</p>
                    </div>

                    {/* Grid: 2 columns on mobile, 4 on desktop */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {filtered.map((p: Product) => (
                            <a href={`/product/${p.id}`} key={p.id} className="bg-white rounded-[24px] md:rounded-[32px] p-3 md:p-6 border border-zinc-100 hover:border-[#D4AF37] hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] transition-all duration-500 group relative flex flex-col h-full cursor-pointer">
                                <div className="aspect-square bg-zinc-50 rounded-xl md:rounded-2xl mb-4 md:mb-6 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
                                    <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-700" />
                                    {p.isCOD && (
                                        <span className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-zinc-100 text-zinc-500">COD</span>
                                    )}
                                    {!p.inStock && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                            <span className="text-[8px] md:text-[10px] tracking-widest uppercase font-black text-red-500 border border-red-500 px-3 py-1.5 rounded-full transform -rotate-12">Sold Out</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-grow space-y-1 md:space-y-2 flex flex-col">
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{p.category}</span>
                                    <h3 className="text-xs md:text-lg font-serif font-bold md:h-14 line-clamp-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>{p.name}</h3>
                                    <div className="mt-auto pt-2 md:pt-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[7px] md:text-[9px] font-black uppercase tracking-tighter text-zinc-400 mb-0.5">Investment</p>
                                            <p className="text-sm md:text-xl font-black">₦{p.price.toLocaleString()}</p>
                                        </div>
                                        <button
                                            disabled={!p.inStock}
                                            onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); addToCart(p); }}
                                            className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${p.inStock ? "bg-[#D4AF37] text-white hover:bg-[#3E2723] shadow-[#D4AF37]/20" : "bg-zinc-100 text-zinc-300 cursor-not-allowed shadow-none"}`}
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5 md:w-5 md:h-5" />
                                        </button>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filtered.length === 0 && (
                        <div className="text-center py-20 bg-[#D4AF37]/5 rounded-[40px] md:rounded-[60px] border border-[#D4AF37]/20 border-dashed max-w-4xl mx-auto">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-zinc-100 text-[#D4AF37]">
                                <Search className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <h2 className="text-2xl md:text-5xl font-serif font-black mb-6 px-6 text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>Scent Not Found?</h2>
                            <p className="text-zinc-500 font-medium text-sm md:text-lg mb-10 px-8 max-w-2xl mx-auto leading-relaxed">
                                Our boutique is ever-evolving. If your desired fragrance isn't listed, <span className="text-zinc-900 font-black">let us know on WhatsApp</span> or the site, and we'll review it for addition in less than 48 hours.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6">
                                <a
                                    href={`https://wa.me/2348132484859?text=Hello Wear Abbie, I am looking for a fragrance that is not on your site: ${searchQuery}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full sm:w-auto bg-[#25D366] text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all"
                                >
                                    Contact on WhatsApp <span className="text-sm">→</span>
                                </a>
                                <button
                                    onClick={() => { setSearchQuery(""); setCategory("All"); }}
                                    className="w-full sm:w-auto bg-zinc-900 text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-[#3E2723] transition-all"
                                >
                                    Reset Selection
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-zinc-50 pt-16 md:pt-20 pb-10 border-t border-zinc-100">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-20 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start">
                        <img src="/logo.png" alt="Logo" className="h-10 md:h-12 mb-8" />
                        <p className="text-zinc-500 text-sm leading-relaxed mb-8">Smelling nice is our priority. Wear Abbie Signature is dedicated to bringing you the finest fragrances with an unmatched level of service.</p>
                        <div className="flex gap-5">
                            <a href="https://www.tiktok.com/@wear.abbie?_r=1&_t=ZS-94I4fSegq5S" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#D4AF37] transition-all transform hover:scale-110">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.23-.15-.44-.31-.64-.49v8.29c.04 1.48-.41 3.01-1.39 4.11-1.15 1.4-3.03 2.1-4.78 1.95-1.76-.01-3.52-.92-4.48-2.39-1.02-1.42-1.22-3.32-.57-4.89.65-1.74 2.27-3.04 4.1-3.23l.11 4.13c-1.3-.02-2.73.74-3.19 1.96-.28.81-.13 1.73.34 2.45.42.72 1.25 1.15 2.08 1.15.71-.01 1.4-.35 1.83-.91.43-.6.54-1.39.51-2.12V.02z" /></svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 md:mb-8 text-zinc-400">Collections</h4>
                        <ul className="space-y-3 md:space-y-4 text-sm font-bold text-zinc-500">
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="/shop">Wear Abbie Boutique</a></li>
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="/journal">The Journal</a></li>
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors">Gifting Suite</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 md:mb-8 text-zinc-400">Wear Abbie Help</h4>
                        <ul className="space-y-3 md:space-y-4 text-sm font-bold text-zinc-500">
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="/tracking">Order Tracking</a></li>
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors">Customer Support</li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 md:mb-8 text-zinc-400">Our Promise</h4>
                        <div className="space-y-4 md:space-y-6">
                            {[
                                { icon: <ShieldCheck className="w-5 h-5" />, txt: "Original Products" },
                                { icon: <Truck className="w-5 h-5" />, txt: "Secure Nationwide Shipping" },
                                { icon: <CreditCard className="w-5 h-5" />, txt: "Secure Payments" }
                            ].map((p, i) => (
                                <div key={i} className="flex items-center gap-4 text-sm font-bold text-zinc-500 justify-center md:justify-start">
                                    <span className="text-[#D4AF37]">{p.icon}</span>
                                    {p.txt}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 pt-10 border-t border-zinc-200 text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <p>© 2026 Wear Abbie Signature. Smelling nice is our priority.</p>
                </div>
            </footer>

        </div>
    );
}
