"use client";

import React, { useState } from 'react';
import { Search, ShoppingBag, User, Menu, X, ArrowRight, Sparkles, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function Journal() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            `}</style>

            {/* Top Banner */}
            <div className="bg-black text-white text-[9px] md:text-xs py-3 md:py-4 text-center tracking-[0.3em] md:tracking-[0.4em] font-black uppercase">
                <span className="text-[#D4AF37]">★</span> Smelling nice is our priority • <span className="text-[#D4AF37]">★</span>
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
                            <a href="/shop" className="hover:text-[#D4AF37] transition-colors">Collections</a>
                            <a href="/journal" className="text-zinc-900 border-b-2 border-[#D4AF37] pb-1">The Journal</a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="flex items-center gap-4 md:gap-6">
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
                    <div className="lg:hidden bg-white border-b border-zinc-100 py-8 px-6 space-y-6">
                        <div className="flex flex-col gap-6 text-[13px] font-black uppercase tracking-[0.2em]">
                            <a href="/" className="text-zinc-400 hover:text-zinc-900" onClick={() => setIsMenuOpen(false)}>Home</a>
                            <a href="/shop" className="text-zinc-400 hover:text-zinc-900" onClick={() => setIsMenuOpen(false)}>Collections</a>
                            <a href="/journal" className="text-[#D4AF37]" onClick={() => setIsMenuOpen(false)}>The Journal</a>
                            <a href="/auth" className="text-zinc-400 hover:text-zinc-900" onClick={() => setIsMenuOpen(false)}>Login / Register</a>
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-grow">
                {/* Journal Hero */}
                <header className="container mx-auto px-4 py-16 md:py-32 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.4em] mb-8">
                        <Sparkles className="w-3 h-3" /> The Wear Abbie Narrative
                    </div>
                    <h1 className="text-5xl md:text-[7rem] font-serif font-black mb-10 md:mb-16 tracking-tighter leading-[0.9]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Smelling Nice <br />
                        <span className="text-[#D4AF37] italic font-light">is our</span> <br />
                        Priority.
                    </h1>
                    <p className="text-lg md:text-2xl text-zinc-500 font-medium leading-relaxed italic">
                        "Fragrance is the invisible bridge between memory and the soul. At Wear Abbie, we don't just sell perfumes; we curate signatures."
                    </p>
                </header>

                {/* Main Content */}
                <section className="container mx-auto px-4 py-20 border-t border-zinc-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center mb-32">
                        <div>
                            <div className="h-0.5 w-12 bg-[#D4AF37] mb-8"></div>
                            <h2 className="text-4xl md:text-5xl font-serif font-black mb-8" style={{ fontFamily: 'var(--font-playfair), serif' }}>The Genesis of <span className="text-[#D4AF37]">Wear Abbie</span></h2>
                            <p className="text-zinc-500 text-lg leading-relaxed mb-6">
                                Founded on the principle that excellence is not an act, but a habit, Wear Abbie was born from a desire to redefine the luxury fragrance landscape in Nigeria. We realized that while many wear scents, few carry a signature.
                            </p>
                            <p className="text-zinc-500 text-lg leading-relaxed mb-10">
                                Our founder's vision was simple yet profound: **Smelling nice is our priority.** This isn't just a tagline; it's our operational compass. From the selection of oil concentrations to the aesthetics of our bottles, every detail is engineered for an elite experience.
                            </p>
                            <a href="/shop" className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-[#3E2723] transition-all group">
                                Explore the collection <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </a>
                        </div>
                        <div className="relative rounded-[40px] overflow-hidden shadow-2xl">
                            <img src="/perfumes/barakkat-rouge-540-maison-alhambra.png" alt="Philosophy" className="w-full h-[500px] object-cover" />
                            <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="p-10 bg-zinc-50 rounded-[40px] border border-zinc-100 hover:shadow-xl transition-all h-full">
                            <h3 className="text-2xl font-serif font-black mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>Quality First</h3>
                            <p className="text-zinc-500 leading-relaxed font-medium">
                                We source only the finest fragrance oils, ensuring that every spray delivers a long-lasting, complex olfactory journey that evolves on your skin.
                            </p>
                        </div>
                        <div className="p-10 bg-zinc-50 rounded-[40px] border border-zinc-100 hover:shadow-xl transition-all h-full">
                            <h3 className="text-2xl font-serif font-black mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>The Elite Curation</h3>
                            <p className="text-zinc-500 leading-relaxed font-medium">
                                Every fragrance in our boutique is hand-selected. We don't believe in overwhelming choice; we believe in providing the perfect ones.
                            </p>
                        </div>
                        <div className="p-10 bg-zinc-50 rounded-[40px] border border-zinc-100 hover:shadow-xl transition-all h-full">
                            <h3 className="text-2xl font-serif font-black mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>Modern Service</h3>
                            <p className="text-zinc-500 leading-relaxed font-medium">
                                Luxury shouldn't be difficult. With our secure checkout, nationwide logistics, and elite support, we make your scent journey effortless.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
