"use client";

import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, MessageCircle, ArrowRight, SlidersHorizontal, Trash2, Plus, Minus, X, Trash, ShieldCheck, LayoutDashboard, Truck, CreditCard, Package } from 'lucide-react';
import productsData from '@/data/products.json';
import { useCart, Product, CartItem } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import MotionGraphics from '@/components/MotionGraphics';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import MemberNavbar from '@/components/layout/MemberNavbar';


// --- Monolithic Page Component ---
export default function Home() {
    const { cart, addToCart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, searchQuery, setSearchQuery } = useCart();
    const [isImageExpanded, setIsImageExpanded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);


    // Featured products from data
    const featuredProducts = (productsData as Product[]).slice(0, 4);

    // Cart logic handled by CartContext

    const cartCount = cart.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);

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
                Smelling nice is our priority • <span className="underline decoration-[#D4AF37] underline-offset-4">Secure Checkout</span> • Nationwide Logistics
            </div>

            <MemberNavbar />
            <div className="h-4 md:h-8 lg:h-12"></div>


            <main className="flex-grow">
                {/* Hero Section */}
                <section className="container mx-auto px-4 py-12 md:py-24 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                        <div className="text-center lg:text-left order-2 lg:order-1">
                            <div className="inline-flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-full px-6 py-2 mb-8">
                                <Package className="w-4 h-4 text-[#D4AF37]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Authentic Fragrances</span>
                            </div>
                            <h1 className="text-4xl md:text-7xl lg:text-[7rem] font-serif font-black leading-[1.1] lg:leading-[0.95] mb-6 md:mb-8 tracking-tighter text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                Smelling nice <br />
                                <span className="text-[#D4AF37] italic font-light">is our</span> <br />
                                priority.
                            </h1>
                            <p className="text-sm md:text-lg text-zinc-500 max-w-lg mx-auto lg:mx-0 mb-8 md:mb-10 font-medium leading-relaxed">
                                Discover a curated collection of fine fragrances. We bring you hand-selected scents designed for those who value quality and elegance.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href="/shop" className="bg-[#3E2723] text-white rounded-full px-10 py-5 font-black uppercase tracking-widest text-[11px] hover:bg-black transform hover:-translate-y-1 transition-all shadow-xl flex items-center justify-center gap-3">
                                    Browse Shop <ArrowRight className="w-4 h-4" />
                                </Link>
                                {isLoggedIn ? (
                                    <Link href="/dashboard" className="bg-[#D4AF37] text-white rounded-full px-10 py-5 font-black uppercase tracking-widest text-[11px] hover:bg-[#3E2723] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#D4AF37]/20">
                                        My Account <LayoutDashboard className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <button className="bg-white border border-zinc-200 text-zinc-800 rounded-full px-10 py-5 font-black uppercase tracking-widest text-[11px] hover:border-[#D4AF37] transition-all flex items-center justify-center">
                                        Best Sellers
                                    </button>
                                )}
                            </div>

                            {/* Freestyle Motion Graphics Section */}
                            <div className="mt-8">
                                <MotionGraphics />
                            </div>
                        </div>
                        <div className="relative group p-2 md:p-6 lg:p-0 order-1 lg:order-2 h-full flex items-center justify-center">
                            <div className="absolute -inset-10 bg-[#D4AF37]/10 rounded-full blur-[80px] -z-10 group-hover:bg-[#D4AF37]/20 transition-all duration-1000"></div>

                            {/* Animated High-End Perfume Bottle */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="relative w-full max-w-[400px] md:max-w-[500px] h-[400px] md:h-[600px] mx-auto flex items-center justify-center"
                            >
                                {/* The Bottle Image */}
                                <Image
                                    src="/hero-bottle.png"
                                    alt="Wear Abbie Signature Bottle"
                                    fill
                                    className="object-contain drop-shadow-2xl z-10"
                                    priority
                                />

                                {/* Spray Mist Animation (Spraying to the left) */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0, x: 0, y: -80 }}
                                    animate={{
                                        opacity: [0, 0.4, 0],
                                        scale: [0.5, 2, 3],
                                        x: [0, -150, -300],
                                        y: [-80, -90, -100]
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        repeatType: 'loop',
                                        ease: 'easeOut',
                                        delay: 1
                                    }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-l from-[#D4AF37]/40 to-transparent blur-xl rounded-full z-0 pointer-events-none"
                                />

                                <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-10 p-4 md:p-8 bg-white/20 backdrop-blur-md rounded-[20px] md:rounded-[30px] border border-white/30 shadow-2xl z-20">
                                    <div className="flex items-center gap-3 mb-1 md:mb-2 text-[#D4AF37]">
                                        <div className="h-px w-6 md:w-8 bg-[#D4AF37]"></div>
                                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] drop-shadow-sm text-white">The Collection</span>
                                    </div>
                                    <h3 className="text-lg md:text-3xl font-serif font-black text-white drop-shadow-md" style={{ fontFamily: 'var(--font-playfair), serif' }}>Wear Abbie <span className="italic font-light">Signature</span></h3>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Boutique Selection */}
                <section className="bg-zinc-50 py-16 md:py-32">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-16 gap-6 text-center md:text-left">
                            <div>
                                <h2 className="text-3xl md:text-6xl font-serif font-black mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>Our Fragrance Collection</h2>
                                <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px]">Exclusively Curated For You</p>
                            </div>
                            <a href="/shop" className="text-[#D4AF37] font-black tracking-widest text-[10px] md:text-[11px] uppercase border-b-2 border-[#D4AF37] pb-1 hover:text-[#3E2723] hover:border-[#3E2723] transition-all">
                                Go to Shop
                            </a>
                        </div>

                        {/* MOBILE 2-COLUMN GRID, DESKTOP 4-COLUMN GRID */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {featuredProducts.map(p => (
                                <a href={`/product/${p.id}`} key={p.id} className="bg-white rounded-[24px] md:rounded-[32px] p-3 md:p-6 border border-zinc-100 hover:border-[#D4AF37] hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] transition-all duration-500 group relative flex flex-col h-full cursor-pointer">
                                    <div className="aspect-square bg-zinc-50 rounded-xl md:rounded-2xl mb-4 md:mb-6 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
                                        <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-700" />
                                        {p.isCOD && (
                                            <span className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-zinc-100 text-zinc-500">COD</span>
                                        )}
                                    </div>
                                    <div className="space-y-1 md:space-y-2 flex flex-col flex-grow">
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">{p.category}</span>
                                        <h3 className="text-xs md:text-lg font-serif font-bold md:h-14 line-clamp-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>{p.name}</h3>
                                        <div className="flex items-center justify-between pt-2 md:pt-4 mt-auto">
                                            <div>
                                                <p className="text-[7px] md:text-[9px] font-black uppercase tracking-tighter text-zinc-400 mb-0.5">Price</p>
                                                <p className="text-sm md:text-xl font-black">₦{p.price.toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); addToCart(p); }}
                                                className="w-8 h-8 md:w-12 md:h-12 bg-[#D4AF37] text-white rounded-full flex items-center justify-center hover:bg-[#3E2723] transition-colors shadow-lg shadow-[#D4AF37]/20"
                                            >
                                                <ShoppingBag className="w-3.5 h-3.5 md:w-5 md:h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="container mx-auto px-4 py-20 md:py-40">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="h-1 w-16 md:w-20 bg-[#D4AF37] mx-auto mb-8 md:mb-10"></div>
                        <h2 className="text-3xl md:text-7xl font-serif font-black mb-8 md:mb-10 tracking-tight leading-tight text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>Quality First. <br /> <span className="text-[#D4AF37] italic font-light">Exceptional</span> Service.</h2>
                        <p className="text-sm md:text-xl text-zinc-500 font-medium mb-12 md:mb-20 leading-relaxed max-w-2xl mx-auto">We combine our passion for excellence with efficient delivery. Experience long-lasting scents and service that respects your time.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 text-center">
                            {[
                                { label: "Long Lasting", val: "24H+", sub: "High concentration oils" },
                                { label: "Happy Customers", val: "99%", sub: "Nationwide Satisfaction" },
                                { label: "Secure Payment", val: "Instant", sub: "Bank Transfer & Card" }
                            ].map((s, i) => (
                                <div key={i} className="bg-white border border-zinc-100 rounded-[30px] md:rounded-[40px] p-8 md:p-10 hover:border-[#D4AF37] hover:shadow-2xl transition-all duration-500 group">
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-4 md:mb-6 group-hover:text-[#D4AF37] transition-colors">{s.label}</p>
                                    <p className="text-3xl md:text-5xl font-serif font-black mb-2 md:mb-3 text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>{s.val}</p>
                                    <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-zinc-50 pt-16 md:pt-20 pb-10 border-t border-zinc-100">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-20 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start">
                        <img src="/logo.png" alt="Logo" className="h-10 md:h-12 lg:h-20 mb-8" />
                        <p className="text-zinc-500 text-sm leading-relaxed mb-8">We believe everyone deserves to smell amazing. Wear Abbie Signature is dedicated to bringing you high-quality fragrances with excellent service.</p>
                        <div className="flex gap-5">
                            <a href="https://www.tiktok.com/@wear.abbie?_r=1&_t=ZS-94I4fSegq5S" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#D4AF37] transition-all transform hover:scale-110">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.23-.15-.44-.31-.64-.49v8.29c.04 1.48-.41 3.01-1.39 4.11-1.15 1.4-3.03 2.1-4.78 1.95-1.76-.01-3.52-.92-4.48-2.39-1.02-1.42-1.22-3.32-.57-4.89.65-1.74 2.27-3.04 4.1-3.23l.11 4.13c-1.3-.02-2.73.74-3.19 1.96-.28.81-.13 1.73.34 2.45.42.72 1.25 1.15 2.08 1.15.71-.01 1.4-.35 1.83-.91.43-.6.54-1.39.51-2.12V.02z" /></svg>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 md:mb-8 text-zinc-400">Our Collection</h4>
                        <ul className="space-y-3 md:space-y-4 text-sm font-bold text-zinc-500">
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="/shop">Shop Fragments</a></li>
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="/journal">The Scent Journal</a></li>
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors">Gift Sets</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest text-xs mb-6 md:mb-8 text-zinc-400">Customer Care</h4>
                        <ul className="space-y-3 md:space-y-4 text-sm font-bold text-zinc-500">
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors"><a href="/tracking">Track Order</a></li>
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors">Contact Support</li>
                            <li className="hover:text-zinc-900 cursor-pointer transition-colors">Feedback</li>
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
                <div className="container mx-auto px-4 mt-16 pt-8 border-t border-zinc-50 flex flex-col md:flex-row items-center justify-between text-zinc-500 font-medium">
                    <p>&copy; 2026 Wear Abbie Signature. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-[#D4AF37] transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-[#D4AF37] transition-colors">Shippings & Returns</a>
                    </div>
                </div>
            </footer>

            {/* WhatsApp Floating Action Button */}
            <a
                href="https://wa.me/2348132484859"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 left-6 bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 hover:scale-110 transition-all z-50 flex items-center justify-center gap-3 group"
            >
                <div className="flex items-center max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out">
                    <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-widest pl-2 pr-4">Message us on WhatsApp</span>
                </div>
                <MessageCircle className="w-6 h-6 flex-shrink-0" />
            </a>
        </div>
    );
}
