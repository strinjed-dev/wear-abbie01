"use client";

import React, { useState } from 'react';
import { User, Package, MapPin, Settings, LogOut, ChevronRight, ShoppingBag, Heart, Star, Clock, ArrowRight, ShieldCheck, Instagram, Facebook, Twitter, Phone, Mail, Edit3, Camera } from 'lucide-react';

export default function ProfilePage() {
    const [activeSection, setActiveSection] = useState('overview');

    // Simulate User Data
    const user = {
        name: "Ibrahim Tijani",
        email: "ibrahim@wearabbie.com",
        phone: "+234 812 345 6789",
        memberSince: "Dec 2025",
        orders: [
            { id: "WA-982341", date: "Feb 22, 2026", status: "In Transit", total: "₦17,500", items: 1 },
            { id: "WA-982102", date: "Jan 15, 2026", status: "Delivered", total: "₦45,000", items: 3 }
        ]
    };

    return (
        <div className="min-h-screen flex flex-col bg-white text-zinc-900 overflow-x-hidden">
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
                    <a href="/" className="group">
                        <img src="/logo.png" alt="Wear Abbie" className="h-8 md:h-10" />
                    </a>
                    <div className="flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 hidden lg:flex">
                        <a href="/" className="hover:text-zinc-900 transition-colors">Home</a>
                        <a href="/shop" className="hover:text-zinc-900 transition-colors">Collections</a>
                        <a href="/journal" className="hover:text-zinc-900 transition-colors">The Journal</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#3E2723] rounded-full flex items-center justify-center text-white font-black text-xs">IT</div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow flex flex-col lg:flex-row min-h-[calc(100vh-100px)]">
                {/* Sidebar */}
                <aside className="w-full lg:w-80 border-r border-zinc-100 p-8 md:p-12 lg:p-16 space-y-12">
                    <div className="text-center lg:text-left">
                        <div className="relative inline-block mb-6">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-50 rounded-[40px] flex items-center justify-center text-zinc-200 border border-zinc-100 relative overflow-hidden group">
                                <User className="w-12 h-12 md:w-16 md:h-16" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-white p-2.5 rounded-2xl shadow-xl shadow-[#D4AF37]/20">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-serif font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>{user.name}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Elite Member since {user.memberSince}</p>
                    </div>

                    <nav className="space-y-3">
                        <ProfileNavItem icon={<Package className="w-5 h-5" />} label="Order History" active={activeSection === 'overview'} onClick={() => setActiveSection('overview')} />
                        <ProfileNavItem icon={<Heart className="w-5 h-5" />} label="Fragrance Wishlist" active={activeSection === 'wishlist'} onClick={() => setActiveSection('wishlist')} />
                        <ProfileNavItem icon={<MapPin className="w-5 h-5" />} label="Shipping Vault" active={activeSection === 'shipping'} onClick={() => setActiveSection('shipping')} />
                        <ProfileNavItem icon={<Settings className="w-5 h-5" />} label="Account Intel" active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} />
                    </nav>

                    <div className="pt-10 border-t border-zinc-50">
                        <button className="flex items-center gap-4 text-zinc-400 hover:text-red-500 transition-colors uppercase font-black text-[10px] tracking-widest">
                            <LogOut className="w-5 h-5" /> Retract Access
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-grow p-8 md:p-16 lg:p-24 bg-zinc-50/50 animate-in">
                    <div className="max-w-4xl mx-auto">
                        {activeSection === 'overview' && (
                            <section className="space-y-12">
                                <header className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2">Tracking Activity</p>
                                        <h3 className="text-3xl md:text-5xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>Recent Dispatches</h3>
                                    </div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hidden sm:block">Found {user.orders.length} Records</p>
                                </header>

                                <div className="space-y-6">
                                    {user.orders.map((order, i) => (
                                        <div key={i} className="bg-white p-8 md:p-10 rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/30 transition-all group cursor-pointer group">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-zinc-50 rounded-[20px] flex items-center justify-center text-zinc-200 group-hover:bg-[#D4AF37]/5 group-hover:text-[#D4AF37] transition-all">
                                                        <Package className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="font-black text-sm uppercase tracking-tight">{order.id}</span>
                                                            <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${order.status === 'In Transit' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-emerald-50 text-emerald-500'}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{order.date} • {order.items} Items</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-6 md:pt-0">
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Total Investment</p>
                                                        <p className="font-black text-xl">{order.total}</p>
                                                    </div>
                                                    <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center group-hover:bg-[#3E2723] group-hover:text-white transition-all">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-10 bg-[#3E2723] rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer overflow-hidden relative shadow-2xl">
                                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl group-hover:bg-[#D4AF37]/20 transition-all duration-1000"></div>
                                    <div className="relative z-10 text-center md:text-left">
                                        <h4 className="text-2xl md:text-3xl font-serif font-black mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Begin a New Selection</h4>
                                        <p className="text-white/50 text-[11px] font-black uppercase tracking-widest">Curated fragrances awaiting your signature.</p>
                                    </div>
                                    <a href="/shop" className="relative z-10 bg-[#D4AF37] text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl hover:scale-105 transition-all flex items-center gap-4">
                                        Explore Boutique <ShoppingBag className="w-4 h-4" />
                                    </a>
                                </div>
                            </section>
                        )}

                        {activeSection === 'settings' && (
                            <section className="space-y-12">
                                <header>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-2">Account Intel</p>
                                    <h3 className="text-3xl md:text-5xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>Personal Configuration</h3>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-white p-10 rounded-[40px] border border-zinc-100 space-y-8">
                                        <div className="flex justify-between items-center">
                                            <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><User className="w-5 h-5" /></div>
                                            <button className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]">Modify</button>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-2">Full Name</h4>
                                            <p className="font-bold text-lg">{user.name}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-10 rounded-[40px] border border-zinc-100 space-y-8">
                                        <div className="flex justify-between items-center">
                                            <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><Mail className="w-5 h-5" /></div>
                                            <button className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]">Modify</button>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-2">Authenticated Email</h4>
                                            <p className="font-bold text-lg">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-10 rounded-[40px] border border-zinc-100 space-y-8">
                                        <div className="flex justify-between items-center">
                                            <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><Phone className="w-5 h-5" /></div>
                                            <button className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]">Modify</button>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-2">Logistics Contact</h4>
                                            <p className="font-bold text-lg">{user.phone}</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#121212] p-10 rounded-[40px] text-white space-y-8 flex flex-col justify-between group cursor-pointer hover:bg-black transition-all">
                                        <div className="flex justify-between items-center">
                                            <div className="p-3 bg-white/5 rounded-2xl text-[#D4AF37]"><ShieldCheck className="w-5 h-5" /></div>
                                            <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-1">Authorization</h4>
                                            <p className="font-black text-xs uppercase tracking-widest text-zinc-400">Bootstrap Key Required</p>
                                            <h3 className="text-xl font-serif font-black group-hover:text-[#D4AF37] transition-all" style={{ fontFamily: 'var(--font-playfair), serif' }}>Elite Admin Access</h3>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-zinc-50 py-10 border-t border-zinc-100">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">© 2026 Wear Abbie Signature Account Services</p>
                    <div className="flex gap-6">
                        <Instagram className="w-4 h-4 text-zinc-300 hover:text-[#D4AF37] transition-colors" />
                        <Facebook className="w-4 h-4 text-zinc-300 hover:text-[#D4AF37] transition-colors" />
                        <Twitter className="w-4 h-4 text-zinc-300 hover:text-[#D4AF37] transition-colors" />
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ProfileNavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-5 px-8 py-5 rounded-[24px] cursor-pointer transition-all duration-300 ${active ? 'bg-[#3E2723] text-[#D4AF37] shadow-xl shadow-black/20' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
        >
            <span className={active ? "text-[#D4AF37]" : "text-zinc-400"}>{icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}
