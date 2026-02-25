"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingBag, ChevronLeft, Heart, Share2, Sparkles, Truck, ShieldCheck, CreditCard, Star, Plus, Minus, ArrowRight, Instagram, Facebook, Twitter, X } from 'lucide-react';
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

export default function ProductDetailPage() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const foundProduct = productsData.find(p => p.id === id);
        if (foundProduct) {
            setProduct(foundProduct as Product);
        }
        setIsLoading(false);
    }, [id]);

    const addToCart = () => {
        if (!product) return;
        setCart((prev: CartItem[]) => {
            const existing = prev.find((item: CartItem) => item.id === product.id);
            if (existing) {
                return prev.map((item: CartItem) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { ...product, quantity }];
        });
        setIsCartOpen(true);
    };

    if (isLoading) return <div>Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center font-serif text-3xl">Product Not Found.</div>;

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                :root { --font-outfit: 'Outfit', sans-serif; --font-playfair: 'Playfair Display', serif; }
                body { font-family: var(--font-outfit); }
                .font-serif { font-family: var(--font-playfair); }
                .animate-in { animation: fade-in 0.6s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Navbar */}
            <nav className="border-b border-zinc-100 py-6 md:py-8 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <a href="/shop" className="flex items-center gap-3 text-zinc-400 hover:text-zinc-900 transition-colors group">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Back to Boutique</span>
                    </a>
                    <a href="/">
                        <img src="/logo.png" alt="Wear Abbie" className="h-8 md:h-10" />
                    </a>
                    <div className="relative cursor-pointer group" onClick={() => setIsCartOpen(true)}>
                        <ShoppingBag className="w-6 h-6 group-hover:text-[#D4AF37] transition-colors" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                                {cartCount}
                            </span>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    {/* Left: Interactive Image */}
                    <div className="space-y-8 sticky top-32">
                        <div className="aspect-[4/5] bg-zinc-50 rounded-[40px] md:rounded-[60px] p-8 md:p-16 flex items-center justify-center relative overflow-hidden group shadow-sm border border-zinc-100">
                            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute top-8 right-8 flex flex-col gap-4">
                                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:text-red-500 transition-colors">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:text-[#D4AF37] transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Intel */}
                    <div className="space-y-12 animate-in">
                        <header>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{product.category}</span>
                                <div className="flex items-center gap-1 text-zinc-900">
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="text-[10px] font-bold text-zinc-400 ml-2 uppercase tracking-widest">Elite Verified</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-serif font-black mb-6 tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>{product.name}</h1>
                            <div className="flex items-baseline gap-4">
                                <p className="text-3xl md:text-5xl font-black">₦{product.price.toLocaleString()}</p>
                                <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest">Tax Included</p>
                            </div>
                        </header>

                        <div className="p-8 bg-zinc-50 rounded-[40px] border border-zinc-100">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Olfactory Narrative</h3>
                            <p className="text-zinc-500 font-medium leading-relaxed text-lg italic">
                                "{product.description || "A masterfully curated scent designed to leave a lasting impression. Experience the elite craftsmanship of Wear Abbie's signature olfactory collection."}"
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex items-center bg-zinc-50 rounded-full border border-zinc-100 p-2">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-full transition-all">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-full transition-all">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    disabled={!product.inStock}
                                    onClick={addToCart}
                                    className="flex-grow bg-[#D4AF37] text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#D4AF37]/20 hover:bg-[#3E2723] transition-all flex items-center justify-center gap-4 group"
                                >
                                    {product.inStock ? (
                                        <>Add to Boutique Bag <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" /></>
                                    ) : (
                                        "Currently Sold Out"
                                    )}
                                </button>
                            </div>

                            <a
                                href="/checkout"
                                className="w-full bg-[#3E2723] text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all flex items-center justify-center gap-4 shadow-xl"
                            >
                                Fast Purchase <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Value Props */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-zinc-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><Truck className="w-5 h-5" /></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nationwide <br /> Dispatch</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><ShieldCheck className="w-5 h-5" /></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Authentic <br /> Signature</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><CreditCard className="w-5 h-5" /></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Secure <br /> Checkout</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-zinc-50 pt-20 pb-10 border-t border-zinc-100">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start">
                        <img src="/logo.png" alt="Logo" className="h-10 mb-8" />
                        <p className="text-zinc-500 text-sm leading-relaxed mb-8 italic">Smelling nice is our priority.</p>
                        <div className="flex gap-5">
                            <Instagram className="w-4 h-4 text-zinc-300 hover:text-[#D4AF37] transition-colors" />
                            <Facebook className="w-4 h-4 text-zinc-300 hover:text-[#D4AF37] transition-colors" />
                            <Twitter className="w-4 h-4 text-zinc-300 hover:text-[#D4AF37] transition-colors" />
                        </div>
                    </div>
                </div>
            </footer>

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-8 animate-in">
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-2xl font-black uppercase tracking-widest">Boutique Bag</h2>
                            <button onClick={() => setIsCartOpen(false)}><X className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-grow space-y-8 overflow-y-auto no-scrollbar">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-6 pb-8 border-b border-zinc-50">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-2xl p-2 flex items-center justify-center">
                                        <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="font-serif font-black text-sm">{item.name}</h4>
                                        <p className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest mb-4">{item.category}</p>
                                        <p className="font-black text-sm">₦{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-8 border-t border-zinc-100 space-y-6">
                            <div className="flex justify-between text-xl font-black">
                                <span>Total</span>
                                <span className="text-[#D4AF37]">₦{cartTotal.toLocaleString()}</span>
                            </div>
                            <a href="/checkout" className="block w-full bg-[#3E2723] text-white py-6 rounded-full text-center font-black uppercase tracking-widest text-xs shadow-xl">Complete Purchase</a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
