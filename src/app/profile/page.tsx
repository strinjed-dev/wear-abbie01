"use client";

import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Settings, LogOut, ChevronRight, ShoppingBag, Heart, ShieldCheck, Phone, Mail, ArrowRight, LayoutDashboard } from 'lucide-react';
import MemberNavbar from '@/components/layout/MemberNavbar';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
export default function ProfilePage() {
    const { orders } = useCart();
    const [activeSection, setActiveSection] = useState('overview');
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/auth');
            } else {
                setUserData(session.user);
            }
            setLoading(false);
        };
        checkAuth();
    }, [router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!userData) return null;

    const userDisplay = {
        name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || "Member",
        email: userData.email,
        phone: userData.user_metadata?.phone || "No phone added",
        memberSince: new Date(userData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        orders: orders
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

            <MemberNavbar />

            <main className="flex-grow flex flex-col lg:flex-row min-h-[calc(100vh-100px)] pt-20 md:pt-0">
                {/* Sidebar */}
                <aside className="w-full lg:w-80 border-b lg:border-r border-zinc-100 p-6 md:p-12 lg:p-16 space-y-8 lg:space-y-12 bg-white">
                    <div className="flex lg:flex-col items-center gap-6 lg:gap-0 lg:text-left">
                        <div className="relative inline-block lg:mb-6 flex-shrink-0">
                            <div className="w-20 h-20 md:w-32 md:h-32 bg-zinc-50 rounded-[30px] md:rounded-[40px] flex items-center justify-center text-zinc-200 border border-zinc-100 relative overflow-hidden group">
                                <User className="w-10 h-10 md:w-16 md:h-16" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-white p-1.5 md:p-2.5 rounded-xl shadow-xl">
                                <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>{userDisplay.name}</h2>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] mt-1">Elite Membership Active</p>
                        </div>
                    </div>

                    <nav className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-4 lg:pb-0 lg:space-y-3">
                        <ProfileNavItem icon={<Package className="w-4 h-4" />} label="Orders" active={activeSection === 'overview'} onClick={() => setActiveSection('overview')} />
                        <ProfileNavItem icon={<Heart className="w-4 h-4" />} label="Wishlist" active={activeSection === 'wishlist'} onClick={() => setActiveSection('wishlist')} />
                        <ProfileNavItem icon={<Settings className="w-4 h-4" />} label="Settings" active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} />
                    </nav>

                    <div className="hidden lg:block pt-10 border-t border-zinc-50">
                        <button
                            onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
                            className="flex items-center gap-4 text-zinc-400 hover:text-red-500 transition-colors uppercase font-black text-[10px] tracking-widest"
                        >
                            <LogOut className="w-5 h-5" /> Retract Access
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-grow p-6 md:p-16 lg:p-24 bg-zinc-50/50 animate-in">
                    <div className="max-w-4xl mx-auto">
                        {activeSection === 'overview' && (
                            <section className="space-y-8 md:space-y-12">
                                <header className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Activities</p>
                                        <h3 className="text-2xl md:text-5xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>Recent Dispatches</h3>
                                    </div>
                                </header>

                                <div className="space-y-6">
                                    {userDisplay.orders.map((order, i) => (
                                        <div key={i} className="bg-white p-8 md:p-10 rounded-[40px] border border-zinc-100 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/30 transition-all group cursor-pointer">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

                                                <div>
                                                    <span className="font-black text-sm uppercase tracking-tight">
                                                        {order.id}
                                                    </span>

                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                        {order.date} • {order.items.length} Items
                                                    </p>
                                                </div>

                                                <p className="font-black text-xl">
                                                    {order.total}
                                                </p>

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
                                            <p className="font-bold text-lg">{userDisplay.name}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-10 rounded-[40px] border border-zinc-100 space-y-8">
                                        <div className="flex justify-between items-center">
                                            <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><Mail className="w-5 h-5" /></div>
                                            <button className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]">Modify</button>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-2">Authenticated Email</h4>
                                            <p className="font-bold text-lg">{userDisplay.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-10 rounded-[40px] border border-zinc-100 space-y-8">
                                        <div className="flex justify-between items-center">
                                            <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><Phone className="w-5 h-5" /></div>
                                            <button className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest border-b border-[#D4AF37]">Modify</button>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-2">Logistics Contact</h4>
                                            <p className="font-bold text-lg">{userDisplay.phone}</p>
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
                    <a href="https://www.tiktok.com/@wear.abbie" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-[#D4AF37] transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.88a8.28 8.28 0 004.84 1.54V7a4.85 4.85 0 01-1.07-.31z" /></svg>
                    </a>
                </div>
            </footer>
        </div>
    );
}

function ProfileNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
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
