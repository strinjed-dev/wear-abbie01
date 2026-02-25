"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, Truck, Settings, LogOut, Edit3, BarChart3, Clock, CheckCircle2, Search, Bell, Plus, Image as ImageIcon, Database, Menu, Sparkles, Lock, ShieldCheck, ArrowRight, X, Upload } from 'lucide-react';
import { uploadImage, supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';

// --- Monolithic Admin Component ---
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('inventory');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [bootstrapKey, setBootstrapKey] = useState("");
    const [authError, setAuthError] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const { orders } = useCart();

    const REQUIRED_KEY = process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_KEY || "WEAR_ABBIE_ADMIN_2026";

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (bootstrapKey === REQUIRED_KEY) {
            setIsAuthorized(true);
            setAuthError(false);
            localStorage.setItem("wear_abbie_admin_authorized", "true");
        } else {
            setAuthError(true);
        }
    };

    const [jwtPreview, setJwtPreview] = useState<string>('');
    const [authChecking, setAuthChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
                window.location.href = '/auth'; // Require Supabase Session first
                return;
            }

            // Set Developer info securely for Admin page display
            const jwt = session.access_token;
            setJwtPreview(`${jwt.substring(0, 15)}...${jwt.substring(jwt.length - 15)}`);

            const authorized = localStorage.getItem("wear_abbie_admin_authorized");
            if (authorized === "true") {
                setIsAuthorized(true);
            }
            setAuthChecking(false);
        };
        checkAuth();
    }, []);

    const handleLogout = () => {
        setIsAuthorized(false);
        localStorage.removeItem("wear_abbie_admin_authorized");
        window.location.href = "/";
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const publicUrl = await uploadImage(file, `perfume-${Date.now()}`);
            setUrl(publicUrl);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Verify Supabase configuration.");
        } finally {
            setUploading(false);
        }
    };

    if (authChecking) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-[#D4AF37] rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 sm:p-12">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                    :root { --font-outfit: 'Outfit', sans-serif; --font-playfair: 'Playfair Display', serif; }
                    body { font-family: var(--font-outfit); background: #121212; }
                `}</style>

                <div className="max-w-md w-full animate-in">
                    <div className="text-center mb-12">
                        <img src="/logo.png" alt="Wear Abbie" className="h-12 mx-auto mb-8 brightness-0 invert" />
                        <h1 className="text-3xl md:text-4xl font-serif font-black text-white mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>Autonomous Access</h1>
                        <p className="text-zinc-500 font-medium">Please enter your Bootstrap Key to authorize this session for Wear Abbie Admin Portal.</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input
                                type="password"
                                placeholder="Enter Bootstrap Key"
                                className={`w-full bg-white/5 border ${authError ? 'border-red-500' : 'border-white/10'} rounded-full px-16 py-5 text-white text-sm font-medium focus:bg-white/10 focus:border-[#D4AF37] focus:shadow-xl focus:shadow-[#D4AF37]/5 outline-none transition-all placeholder:text-zinc-700`}
                                value={bootstrapKey}
                                onChange={(e) => setBootstrapKey(e.target.value)}
                            />
                        </div>
                        {authError && <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest">Access Denied: Invalid Key</p>}

                        <button className="w-full bg-[#D4AF37] text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-[#D4AF37]/10 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 group">
                            Unlock Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="mt-12 text-center text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Secure Protocol v2.6 • Port 443 Encryption</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row text-zinc-900 overflow-x-hidden">
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

                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .animate-in {
                    animation: fade-in 0.6s ease-out forwards;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Mobile Header */}
            <header className="lg:hidden bg-[#121212] text-white p-6 flex justify-between items-center sticky top-0 z-50">
                <img src="/logo.png" alt="Wear Abbie" className="h-8 brightness-0 invert" />
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    {isMenuOpen ? <X className="w-6 h-6 rotate-45 text-[#D4AF37]" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Sidebar */}
            <aside className={`w-80 bg-[#121212] text-white flex flex-col p-10 fixed lg:sticky top-0 h-screen z-40 shadow-2xl transition-transform duration-500 lg:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="mb-16 hidden lg:block">
                    <img src="/logo.png" alt="Wear Abbie" className="h-12 mb-4 brightness-0 invert" />
                    <div className="h-px w-full bg-white/10 mb-4"></div>
                    <div className="flex items-center gap-2 text-[10px] tracking-[0.4em] text-[#D4AF37] uppercase font-black">
                        <ShieldCheck className="w-4 h-4" /> Wear Abbie Portal
                    </div>
                </div>

                <nav className="flex-grow space-y-3">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<Package size={20} />} label="Inventory" active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<Users size={20} />} label="Customers" active={activeTab === 'customers'} onClick={() => { setActiveTab('customers'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<Truck size={20} />} label="Logistics" active={activeTab === 'cod'} onClick={() => { setActiveTab('cod'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<BarChart3 size={20} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setIsMenuOpen(false); }} />
                </nav>

                <div className="mt-auto pt-10 border-t border-white/10 space-y-3">
                    <SidebarItem icon={<Settings size={20} />} label="Portal Config" active={false} onClick={() => { }} />
                    <SidebarItem icon={<LogOut size={20} />} label="Retract Access" active={false} onClick={handleLogout} />
                </div>
            </aside>

            {/* Main Admin Content */}
            <main className="flex-grow p-6 md:p-12 lg:p-16 animate-in">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-16 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Autonomous Session Active</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>Wear Abbie Admin</h1>
                        <p className="text-zinc-400 font-medium mt-2">Overseeing your signature fragrance house.</p>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                        <div className="w-12 h-12 bg-white rounded-full border border-zinc-100 flex items-center justify-center relative cursor-pointer hover:bg-zinc-50 transition-colors">
                            <Bell className="w-5 h-5 text-zinc-400" />
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                        </div>
                        <button className="flex-grow md:flex-none bg-[#D4AF37] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-[#3E2723] transition-all shadow-xl shadow-[#D4AF37]/10 flex items-center justify-center gap-3">
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
                    <StatCard label="Catalog Value" value="₦0.00" sub="Waiting for Supabase" icon={<BarChart3 size={24} />} color="border-[#D4AF37]" />
                    <StatCard label="Pending Orders" value={orders.length.toString()} sub="Active placements" icon={<Clock size={24} />} color="border-zinc-900" />
                    <StatCard label="Customers" value={orders.length.toString()} sub="Build your audience" icon={<Users size={24} />} color="border-[#3E2723]" />
                    <StatCard label="Growth" value="0%" sub="Day 1 ready" icon={<CheckCircle2 size={24} />} color="border-emerald-500" />
                </div>

                {/* Inventory Table or Empty State */}
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[500px] flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 text-center md:text-left">
                        <div>
                            <h3 className="text-2xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>Inventory Registry</h3>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Connect your database to manage scents</p>
                        </div>
                        <div className="flex items-center gap-4 bg-zinc-50 p-1.5 rounded-full border border-zinc-100 w-full md:w-auto">
                            <div className="flex items-center px-4 gap-3 flex-grow">
                                <Search className="w-4 h-4 text-zinc-300" />
                                <input type="text" placeholder="Search SKU..." className="bg-transparent border-none outline-none text-xs font-bold w-full md:w-40" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 w-full mt-8">
                        {/* Empty State / Upload Section */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-zinc-200 rounded-[30px] bg-zinc-50 hover:bg-zinc-100 transition-colors">
                            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
                                <Upload className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                            <h2 className="text-2xl font-serif font-black mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Upload Media to Supabase</h2>
                            <p className="text-zinc-500 font-medium max-w-sm mb-8 text-sm">Upload high-resolution perfume imagery to your global storage bucket.</p>

                            <div className="w-full max-w-md space-y-4">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-300 border-dashed rounded-[20px] cursor-pointer bg-white hover:bg-zinc-50">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImageIcon className="w-6 h-6 mb-2 text-zinc-400" />
                                        <p className="mb-1 text-sm text-zinc-500 font-medium">Click to select</p>
                                        {file && <p className="text-xs text-[#D4AF37] font-bold">{file.name}</p>}
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                    />
                                </label>

                                <button
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                    className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all ${!file
                                        ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                        : 'bg-[#3E2723] text-white hover:bg-black shadow-xl shadow-black/10'
                                        }`}
                                >
                                    {uploading ? (
                                        <>Uploading...</>
                                    ) : (
                                        <>Confirm Upload <Sparkles className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>

                            {url && (
                                <div className="mt-8 p-4 bg-emerald-50 text-emerald-700 rounded-[20px] text-sm w-full font-medium text-left border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="font-bold">Upload Successful</span>
                                    </div>
                                    <a href={url} target="_blank" rel="noreferrer" className="text-emerald-600 underline text-xs break-all">
                                        {url}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Inventory Context */}
                        <div className="flex-1 bg-white border border-zinc-100 rounded-[30px] p-8 shadow-sm">
                            <h3 className="text-xl font-serif font-black mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                <Database className="w-5 h-5 text-[#D4AF37]" /> Registry Status
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="font-bold text-sm">Supabase Storage</span>
                                    </div>
                                    <span className="text-xs text-zinc-500 font-medium bg-white px-3 py-1 border border-zinc-200 rounded-full">Active</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                                        <span className="font-bold text-sm">Postgres DB</span>
                                    </div>
                                    <span className="text-xs text-zinc-500 font-medium bg-white px-3 py-1 border border-zinc-200 rounded-full">public.profiles sync</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="font-bold text-sm">Supabase JWT</span>
                                    </div>
                                    <span className="text-xs text-zinc-500 font-medium bg-white px-3 py-1 border border-zinc-200 rounded-full max-w-[150px] truncate">{jwtPreview}</span>
                                </div>
                            </div>
                            <p className="mt-6 text-xs text-zinc-400 leading-relaxed font-medium">
                                Media uploaded here goes straight to the <code>perfume-images</code> secure bucket. You can then attach the provided public URLs to your product definitions in your database.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Orders Live View */}
                <div className="mt-8 bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[300px] flex flex-col">
                    <h3 className="text-2xl font-serif font-black mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>Live Order Feed</h3>
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 mt-4 rounded-3xl bg-zinc-50 border border-zinc-100 opacity-50">
                            <CheckCircle2 className="w-8 h-8 text-zinc-300 mb-4" />
                            <p className="font-bold uppercase tracking-widest text-[10px] text-zinc-400">No recent orders placed</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-6 border border-zinc-100 rounded-[20px] bg-white hover:shadow-lg hover:border-[#D4AF37] transition-all">
                                    <div>
                                        <h4 className="font-black text-xs uppercase tracking-widest inline-flex gap-2 items-center">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            {order.id}
                                        </h4>
                                        <p className="text-[10px] text-zinc-400 mt-2 font-bold">{order.customer?.firstName} {order.customer?.lastName} • {order.items?.length} items</p>
                                        <p className="text-[10px] text-zinc-400 font-bold">{order.customer?.email} • {order.customer?.address}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-serif font-bold text-lg text-[#D4AF37]">₦{order.total.toLocaleString()}</span>
                                        <p className="text-[9px] uppercase tracking-widest text-emerald-500 font-black mt-1">Status: pending</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-5 px-8 py-5 rounded-[24px] cursor-pointer transition-all duration-300 ${active ? 'bg-[#3E2723] text-[#D4AF37] shadow-xl shadow-black/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
            <span className={active ? "text-[#D4AF37]" : "text-zinc-500"}>{icon}</span>
            <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
        </div>
    );
}

function StatCard({ label, value, sub, icon, color }: any) {
    return (
        <div className={`bg-white p-8 md:p-10 rounded-[30px] md:rounded-[40px] border-b-4 ${color} shadow-sm hover:shadow-xl transition-all duration-500 group`}>
            <div className="flex justify-between items-start mb-8 text-zinc-400 group-hover:text-[#D4AF37] transition-colors">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
                <div className="p-3 bg-zinc-50 rounded-2xl">{icon}</div>
            </div>
            <div className="text-3xl md:text-4xl font-serif font-black mb-2 text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>{value}</div>
            <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{sub}</p>
        </div>
    );
}
