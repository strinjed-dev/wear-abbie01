"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, Instagram, Facebook, Twitter, ShieldCheck, Truck, CreditCard, ArrowRight, Sparkles, X, Plus, Minus, Trash2, SlidersHorizontal, BookOpen } from 'lucide-react';
import productsData from '@/data/products.json';

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
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const ALL_PRODUCTS = productsData as Product[];
    const categories = ["All", ...Array.from(new Set(ALL_PRODUCTS.map(p => p.category)))];

    const addToCart = (product: Product) => {
        setCart((prev: CartItem[]) => {
            const existing = prev.find((item: CartItem) => item.id === product.id);
            if (existing) {
                return prev.map((item: CartItem) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id: string) => {
        setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart((prev: CartItem[]) => prev.map((item: CartItem) => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartCount = cart.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);

    const filtered = ALL_PRODUCTS.filter(p => {
        const matchesCategory = category === "All" || p.category === category;
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
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

            {/* Navbar */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-100 py-3 md:py-4">
                <div className="container mx-auto px-4 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <a href="/" className="group">
                            <img src="/logo.png" alt="Wear Abbie" className="h-8 md:h-12 transition-transform duration-500 group-hover:scale-110" />
                        </a>
                        <div className="hidden lg:flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            <a href="/" className="hover:text-[#D4AF37] transition-colors">Home</a>
                            <a href="/shop" className="text-zinc-900 border-b-2 border-[#D4AF37] pb-1">Collections</a>
                            <a href="/journal" className="hover:text-[#D4AF37] transition-colors">The Journal</a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="hidden md:flex items-center w-64 lg:w-80">
                            <div className="flex items-center w-full bg-zinc-50 border border-zinc-100 rounded-full px-5 py-2.5 focus-within:bg-white focus-within:border-[#D4AF37] transition-all">
                                <Search className="w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search catalog..."
                                    value={search}
                                    className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="relative cursor-pointer group" onClick={() => setIsCartOpen(true)}>
                                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 group-hover:text-[#D4AF37] transition-colors" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[8px] md:text-[9px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-black animate-pulse">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <a href="/auth" className="hidden sm:block hover:text-[#D4AF37] transition-colors">
                                <User className="w-6 h-6" />
                            </a>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-1.5 hover:bg-zinc-50 rounded-full transition-colors">
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-white border-b border-zinc-100 py-8 px-6 space-y-6 animate-in">
                        <div className="flex flex-col gap-6 text-[13px] font-black uppercase tracking-[0.2em]">
                            <a href="/" className="text-zinc-400 hover:text-zinc-900" onClick={() => setIsMenuOpen(false)}>Home</a>
                            <a href="/shop" className="text-[#D4AF37]" onClick={() => setIsMenuOpen(false)}>Collections</a>
                            <a href="/journal" className="text-zinc-400 hover:text-zinc-900" onClick={() => setIsMenuOpen(false)}>The Journal</a>
                            <a href="/auth" className="text-zinc-400 hover:text-zinc-900" onClick={() => setIsMenuOpen(false)}>Login / Register</a>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search catalogue..."
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-12 py-4 text-sm font-medium outline-none focus:bg-white focus:border-[#D4AF37]"
                                value={search}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </nav>

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
                        {filtered.map(p => (
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
                        <div className="text-center py-24 md:py-40 bg-zinc-50 rounded-[40px] md:rounded-[60px] border border-zinc-100">
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-zinc-100 text-zinc-200">
                                <Search className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <p className="text-zinc-400 text-3xl md:text-6xl font-serif italic mb-6 px-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>The search remains elusive.</p>
                            <p className="text-zinc-400 font-medium text-sm md:text-lg mb-10 px-8">No fragrances match your current criteria in the boutique.</p>
                            <button onClick={() => { setSearch(""); setCategory("All"); }} className="bg-[#D4AF37] text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#3E2723] transition-all">
                                Reset Selection
                            </button>
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
                            <Instagram className="w-5 h-5 text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer" />
                            <Facebook className="w-5 h-5 text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer" />
                            <Twitter className="w-5 h-5 text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer" />
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

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in">
                        <div className="p-6 md:p-8 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <ShoppingBag className="w-6 h-6 text-[#D4AF37]" />
                                <h2 className="text-xl font-black uppercase tracking-widest">Your Bag</h2>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-16 h-16 md:w-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                                        <ShoppingBag className="w-8 h-8 text-zinc-200" />
                                    </div>
                                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-8">Your bag is empty.</p>
                                    <button onClick={() => setIsCartOpen(false)} className="bg-[#D4AF37] text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em]">Start Shopping</button>
                                </div>
                            ) : (
                                cart.map((item: CartItem) => (
                                    <div key={item.id} className="flex gap-4 md:gap-6 pb-6 md:pb-8 border-b border-zinc-50 last:border-0 group">
                                        <div className="w-16 h-16 md:w-24 bg-zinc-50 rounded-2xl flex-shrink-0 p-3 md:p-4 flex items-center justify-center overflow-hidden">
                                            <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-serif font-black text-sm" style={{ fontFamily: 'var(--font-playfair), serif' }}>{item.name}</h3>
                                                <button onClick={() => removeFromCart(item.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest mb-4">{item.category}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center bg-zinc-50 rounded-full border border-zinc-100 p-0.5 md:p-1">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 md:w-8 h-6 md:h-8 flex items-center justify-center hover:bg-white rounded-full transition-all">
                                                        <Minus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                                    </button>
                                                    <span className="w-6 md:w-8 text-center text-xs font-black">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 md:w-8 h-6 md:h-8 flex items-center justify-center hover:bg-white rounded-full transition-all">
                                                        <Plus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                                    </button>
                                                </div>
                                                <p className="font-black text-sm">₦{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 md:p-8 bg-zinc-50 border-t border-zinc-100 space-y-4">
                                <div className="space-y-2 md:space-y-3">
                                    <div className="flex justify-between text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                        <span>Subtotal</span>
                                        <span className="text-zinc-900">₦{cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-base md:text-lg font-black pt-3 border-t border-zinc-200">
                                        <span>Total</span>
                                        <span className="text-[#D4AF37]">₦{cartTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button className="w-full bg-[#3E2723] text-white py-5 md:py-6 rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4">
                                    Checkout Now <ArrowRight className="w-4 h-4" />
                                </button>
                                <a
                                    href={`https://wa.me/234XXXXXXXXXX?text=Hello%20Wear%20Abbie,%20I'd%20like%20to%20order:%20${cart.map((item: CartItem) => `${item.name}%20(x${item.quantity})`).join(',%20')}.%20Total:%20₦${cartTotal.toLocaleString()}`}
                                    target="_blank"
                                    className="w-full bg-[#25D366] text-white py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all flex items-center justify-center gap-3"
                                >
                                    Order via WhatsApp
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
