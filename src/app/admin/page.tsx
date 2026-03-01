"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, Truck, Settings, LogOut, Edit3, BarChart3, Clock, CheckCircle2, Search, Bell, Plus, Image as ImageIcon, Database, Menu, Sparkles, Lock, ShieldCheck, ArrowRight, X, Upload, HeadphonesIcon, Gift, ShoppingBag } from 'lucide-react';
import { uploadImage, supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { migrateLocalImages } from '@/app/actions/migrateImages';

// --- Monolithic Admin Component ---
interface Product {
    id?: string;
    name: string;
    price: number | string;
    category: string;
    size: string;
    type: string;
    description: string;
    stock: number | string;
    image_url: string;
}

interface Order {
    id: string;
    user_id: string;
    status: string;
    total_amount: number;
    profiles?: { full_name: string; email: string };
    shipping_area: string;
    shipping_state: string;
    items: any[];
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [bootstrapKey, setBootstrapKey] = useState("");
    const [authError, setAuthError] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { orders: localOrders, setIsCartOpen } = useCart();

    const [newProduct, setNewProduct] = useState<Product>({
        name: '',
        price: '',
        category: 'Fragrance',
        size: '100ml',
        type: 'Perfume',
        description: '',
        stock: 0,
        image_url: ''
    });

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const REQUIRED_KEY = process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_KEY || "WEAR_ABBIE_ADMIN_2026";

    const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
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
                fetchInitialData();
            }
            setAuthChecking(false);
        };
        checkAuth();
    }, [refreshTrigger]);

    const fetchInitialData = async () => {
        // Fetch all orders
        const { data: ordersData } = await supabase
            .from('orders')
            .select('*, profiles(full_name, email)')
            .order('created_at', { ascending: false });
        if (ordersData) setAllOrders(ordersData);

        // Fetch all users
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (profilesData) setUsers(profilesData);

        // Fetch all products
        const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });
        if (productsData) setProducts(productsData);
    };

    const addOrUpdateProduct = async () => {
        const payload = editingProduct || newProduct;
        const { error } = await supabase
            .from('products')
            .upsert({
                ...(editingProduct ? { id: editingProduct.id } : {}),
                name: payload.name,
                price: parseFloat(payload.price.toString()),
                category: payload.category,
                size: payload.size,
                type: payload.type,
                description: payload.description,
                stock: parseInt(payload.stock.toString()),
                image_url: payload.image_url || url
            });

        if (!error) {
            alert(editingProduct ? "Product updated!" : "New product launched!");
            setEditingProduct(null);
            setNewProduct({ name: '', price: '', category: 'Fragrance', size: '100ml', type: 'Perfume', description: '', stock: 1, image_url: '' });
            setUrl("");
            setRefreshTrigger((p: number) => p + 1);
        } else {
            console.error("Product action error:", error);
            alert("Error: " + error.message);
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to permanently remove this fragrance from the registry?")) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            setRefreshTrigger((p: number) => p + 1);
        } else {
            alert("Delete failed: " + error.message);
        }
    };

    const toggleStock = async (product: Product) => {
        const newStock = (parseInt(product.stock.toString()) > 0) ? 0 : 50;
        const { error } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', product.id);

        if (!error) {
            setRefreshTrigger((p: number) => p + 1);
        }
    };

    const updateOrderStatus = async (orderId: string, userId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (!error) {
            const messages: Record<string, string> = {
                'processing': "Your payment has been verified. We are now preparing your order!",
                'shipped': "Accord and signature scents dispatched! Real-time tracking updated.",
                'delivered': "Signature delivered. Experience the scent now!",
                'cancelled': "Transaction retracted. Contact support for details."
            };

            if (userId && messages[newStatus]) {
                await supabase.from('notifications').insert({
                    user_id: userId,
                    title: `Dispatch Update: ${newStatus.toUpperCase()}`,
                    message: messages[newStatus],
                    type: "order_update",
                    order_id: orderId
                });
            }

            setRefreshTrigger((prev: number) => prev + 1);
        } else {
            console.error("Status update error:", error);
        }
    };

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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBootstrapKey(e.target.value)}
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
                    <SidebarItem icon={<Users size={20} />} label="Customer Registry" active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<Truck size={20} />} label="Order Tracking" active={activeTab === 'tracking'} onClick={() => { setActiveTab('tracking'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<HeadphonesIcon size={20} />} label="Support Tickets" active={activeTab === 'support'} onClick={() => { setActiveTab('support'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<Gift size={20} />} label="Gifting Suite" active={activeTab === 'gifting'} onClick={() => { setActiveTab('gifting'); setIsMenuOpen(false); }} />
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

                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                        <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-zinc-100 rounded-full border border-zinc-200">
                            <Lock className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Keys: {jwtPreview}</span>
                        </div>
                        <div
                            onClick={() => setIsCartOpen(true)}
                            className="w-12 h-12 bg-white rounded-full border border-zinc-100 flex items-center justify-center relative cursor-pointer hover:bg-zinc-50 transition-colors flex-shrink-0"
                        >
                            <ShoppingBag className="w-5 h-5 text-zinc-900" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                {products.length}
                            </span>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-full border border-zinc-100 flex items-center justify-center relative cursor-pointer hover:bg-zinc-50 transition-colors flex-shrink-0">
                            <Bell className="w-5 h-5 text-zinc-400" />
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                        </div>
                        <button
                            onClick={() => { setActiveTab('inventory'); setEditingProduct(null); }}
                            className="flex-grow md:flex-none bg-[#D4AF37] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-[#3E2723] transition-all shadow-xl shadow-[#D4AF37]/10 flex items-center justify-center gap-3 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
                            <StatCard
                                label="Catalog Value"
                                value={`₦${products.reduce((acc: number, p: Product) => acc + (parseFloat(p.price.toString()) * (parseInt(p.stock.toString()) || 0)), 0).toLocaleString()}`}
                                sub="Total Evaluated Stock"
                                icon={<BarChart3 size={24} />}
                                color="border-[#D4AF37]"
                            />
                            <StatCard label="Pending Orders" value={allOrders.filter((o: Order) => o.status === 'pending').length.toString()} sub="Active placements" icon={<Clock size={24} />} color="border-zinc-900" />
                            <StatCard label="Customers" value={users.length.toString()} sub="Registered users" icon={<Users size={24} />} color="border-[#3E2723]" />
                            <StatCard label="Total Orders" value={allOrders.length.toString()} sub="Life-time volume" icon={<CheckCircle2 size={24} />} color="border-emerald-500" />
                        </div>
                        <div className="mt-8 bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[300px] flex flex-col">
                            <h3 className="text-2xl font-serif font-black mb-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>Live Order Feed</h3>
                            {allOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-10 mt-4 rounded-3xl bg-zinc-50 border border-zinc-100 opacity-50">
                                    <CheckCircle2 className="w-8 h-8 text-zinc-300 mb-4" />
                                    <p className="font-bold uppercase tracking-widest text-[10px] text-zinc-400">No records found in database</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {allOrders.map((order: Order, idx: number) => (
                                        <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border border-zinc-100 rounded-[20px] bg-white hover:shadow-lg hover:border-[#D4AF37] transition-all gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                                    <h4 className="font-black text-[10px] uppercase tracking-widest text-zinc-400">ID: {order.id.split('-')[0]}...</h4>
                                                </div>
                                                <p className="text-xs font-black text-zinc-900 mb-1">{order.profiles?.full_name || "Guest Customer"}</p>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                                                    {order.shipping_area}, {order.shipping_state} • {Array.isArray(order.items) ? order.items.length : 0} items
                                                </p>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <span className="font-serif font-bold text-xl text-[#3E2723]">₦{order.total_amount.toLocaleString()}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.status === 'pending' ? 'text-amber-500 border-amber-500 bg-amber-50' : 'text-emerald-500 border-emerald-500 bg-emerald-50'}`}>
                                                        {order.status}
                                                    </span>
                                                    {order.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id, order.user_id, 'processing')}
                                                            className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#D4AF37] text-white hover:bg-black transition-colors"
                                                        >
                                                            Confirm Payment
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-12">
                        {/* Summary Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <StatCard label="Live Inventory" value={products.length.toString()} sub="Verified Scents" icon={<Package size={24} />} color="border-[#D4AF37]" />
                            <StatCard label="Out of Essence" value={products.filter((p: Product) => !p.stock || parseInt(p.stock.toString()) === 0).length.toString()} sub="Request Restock" icon={<X size={24} />} color="border-red-400" />
                            <StatCard label="Stock Value" value={`₦${products.reduce((acc: number, p: Product) => acc + (parseFloat(p.price.toString()) * (parseInt(p.stock.toString()) || 0)), 0).toLocaleString()}`} sub="Current Evaluation" icon={<BarChart3 size={24} />} color="border-emerald-400" />
                        </div>

                        {/* Inventory Content */}
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[500px] flex flex-col lg:flex-row gap-12">
                            <div className="flex-1 bg-white border border-zinc-100 rounded-[30px] p-8 shadow-sm">
                                <h3 className="text-xl font-serif font-black mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> Operational Insights
                                </h3>

                                <div className="space-y-6">
                                    <div className="p-8 bg-zinc-900 rounded-3xl text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                            <Sparkles size={80} />
                                        </div>
                                        <h4 className="font-serif text-2xl mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>Elite House Management</h4>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] leading-relaxed mb-6">
                                            Your signature collection is currently being viewed by <span className="text-[#D4AF37]">12 active guests</span>.
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#D4AF37] w-[65%]"></div>
                                            </div>
                                            <span className="text-[10px] font-black">65% STOCK</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">System Pulse</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900">Supabase Cloud Connected</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Product Form Side */}
                            <div className="lg:w-1/3 bg-zinc-50/50 p-8 rounded-[30px] border border-zinc-100 h-fit sticky top-12">
                                <h3 className="text-xl font-serif font-black mb-8 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    {editingProduct ? <Edit3 className="w-5 h-5 text-[#D4AF37]" /> : <Plus className="w-5 h-5 text-[#D4AF37]" />}
                                    {editingProduct ? 'Update Essence' : 'Launch New Essence'}
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Name of Scent</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Noir Elegance"
                                            className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-sm font-black text-zinc-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-200"
                                            value={editingProduct ? editingProduct.name : newProduct.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingProduct ? setEditingProduct({ ...editingProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Price (₦)</label>
                                            <input
                                                type="number"
                                                placeholder="25000"
                                                className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-sm font-black text-zinc-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-200"
                                                value={editingProduct ? editingProduct.price : newProduct.price}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingProduct ? setEditingProduct({ ...editingProduct, price: e.target.value }) : setNewProduct({ ...newProduct, price: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Stock Level</label>
                                            <input
                                                type="number"
                                                placeholder="50"
                                                className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-sm font-black text-zinc-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-200"
                                                value={editingProduct ? editingProduct.stock : newProduct.stock}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingProduct ? setEditingProduct({ ...editingProduct, stock: e.target.value }) : setNewProduct({ ...newProduct, stock: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Category</label>
                                        <select
                                            className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-sm font-black text-zinc-900 outline-none focus:border-[#D4AF37] transition-all appearance-none"
                                            value={editingProduct ? editingProduct.category : newProduct.category}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => editingProduct ? setEditingProduct({ ...editingProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })}
                                        >
                                            <option>Fragrance</option>
                                            <option>Boutique</option>
                                            <option>Oil</option>
                                            <option>Signature</option>
                                            <option>Luxe</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Product Story (Description)</label>
                                        <textarea
                                            placeholder="The story behind this scent..."
                                            className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-sm font-medium text-zinc-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-200 min-h-[100px]"
                                            value={editingProduct ? editingProduct.description : newProduct.description}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => editingProduct ? setEditingProduct({ ...editingProduct, description: e.target.value }) : setNewProduct({ ...newProduct, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Size</label>
                                            <select
                                                className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-sm font-black text-zinc-900 outline-none focus:border-[#D4AF37] transition-all appearance-none"
                                                value={editingProduct ? editingProduct.size : newProduct.size}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => editingProduct ? setEditingProduct({ ...editingProduct, size: e.target.value }) : setNewProduct({ ...newProduct, size: e.target.value })}
                                            >
                                                <option>5ml (Roll-on)</option>
                                                <option>10ml</option>
                                                <option>30ml</option>
                                                <option>50ml</option>
                                                <option>100ml</option>
                                                <option>Custom</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Type</label>
                                            <select
                                                className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-sm font-black text-zinc-900 outline-none focus:border-[#D4AF37] transition-all appearance-none"
                                                value={editingProduct ? editingProduct.type : newProduct.type}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => editingProduct ? setEditingProduct({ ...editingProduct, type: e.target.value }) : setNewProduct({ ...newProduct, type: e.target.value })}
                                            >
                                                <option>Spray</option>
                                                <option>Perfume Oil</option>
                                                <option>Extrait</option>
                                                <option>Roll-on</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Image Setup</label>
                                        <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-4">
                                            <input
                                                type="file"
                                                className="hidden"
                                                id="admin-image-upload"
                                                accept="image/*"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) setFile(f);
                                                }}
                                            />
                                            <label htmlFor="admin-image-upload" className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-300 hover:text-[#D4AF37] cursor-pointer border border-zinc-100 border-dashed transition-all">
                                                <Upload size={18} />
                                            </label>
                                            <div className="flex-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest mb-1">{file ? file.name : "Choose File"}</p>
                                                <button onClick={handleUpload} className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest underline disabled:opacity-50" disabled={!file || uploading}>
                                                    {uploading ? "Processing..." : "Confirm Upload"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={addOrUpdateProduct}
                                        className="w-full bg-[#3E2723] text-white py-5 rounded-[20px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 hover:bg-black transition-all"
                                    >
                                        {editingProduct ? 'Finalize Changes' : 'Publish Product'}
                                    </button>
                                    {editingProduct && (
                                        <button
                                            onClick={() => setEditingProduct(null)}
                                            className="w-full text-zinc-400 font-black uppercase tracking-widest text-[10px] pt-2"
                                        >
                                            Cancel Editing
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Product List Side */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>Verified Registry</h3>
                                    <div className="bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100 flex items-center gap-2">
                                        <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{products.length} Products Active</span>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-4 no-scrollbar">
                                    {products.map((p: Product, idx: number) => (
                                        <div key={idx} className="flex flex-col md:flex-row items-center gap-6 p-6 border border-zinc-100 rounded-[24px] bg-white hover:shadow-2xl hover:border-[#D4AF37] transition-all group">
                                            <img src={p.image_url || '/logo.png'} className="w-20 h-20 rounded-2xl object-cover bg-zinc-50 border border-zinc-100" />
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`w-2 h-2 rounded-full ${(parseInt(p.stock.toString()) > 0) ? 'bg-emerald-500' : 'bg-red-400 animate-pulse'}`}></span>
                                                    <h4 className="font-serif font-black text-lg">{p.name}</h4>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full">{p.type}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full">{p.size}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full">₦{parseFloat(p.price.toString()).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex md:flex-col gap-2">
                                                <button
                                                    onClick={() => setEditingProduct(p)}
                                                    className="p-3 bg-zinc-50 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => toggleStock(p)}
                                                    className={`p-3 rounded-xl transition-all ${(parseInt(p.stock.toString()) > 0) ? 'bg-zinc-50 text-zinc-400 hover:text-[#D4AF37]' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}
                                                    title="Toggle Stock Status"
                                                >
                                                    <Package size={18} />
                                                </button>
                                                <button
                                                    onClick={() => p.id && deleteProduct(p.id)}
                                                    className="p-3 bg-red-50 rounded-xl text-red-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {products.length === 0 && (
                                        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-100 rounded-[30px] opacity-50">
                                            <Sparkles className="w-8 h-8 text-zinc-300 mb-4" />
                                            <p className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Registry is currently vacant</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[500px]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                            <div>
                                <h3 className="text-2xl font-serif font-black mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>Customer Registry</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verified User Accounts</p>
                            </div>
                            <div className="bg-zinc-50 px-6 py-3 rounded-full border border-zinc-100">
                                <span className="text-xs font-black text-[#D4AF37]">{users.length} REGISTERED SOULS</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map((u: any, idx: number) => (
                                <div key={idx} className="p-6 border border-zinc-100 rounded-[30px] bg-zinc-50/30 hover:shadow-xl hover:border-[#D4AF37] transition-all group">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-zinc-100 text-[#D4AF37] shadow-sm">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-zinc-900">{u.full_name || 'Anonymous User'}</h4>
                                            <p className="text-[9px] font-bold text-zinc-400 mt-1">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                            <span className="text-zinc-300">Joined</span>
                                            <span className="text-zinc-500">{new Date(u.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                            <span className="text-zinc-300">Role</span>
                                            <span className={`px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-[#3E2723] text-[#D4AF37]' : 'bg-white text-zinc-400 border border-zinc-100'}`}>{u.role}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h3 className="text-2xl font-serif font-black mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>Order Tracking Panel</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Manage Logistics & Fulfillment</p>
                        </div>
                        <div className="flex gap-4">
                            <a
                                href="https://wa.me/2348132484859?text=Hello, I am the admin for Wear Abbie. I need support with a dispatch..."
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#25D366] text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-[9px] flex items-center gap-3 shadow-lg shadow-green-500/10"
                            >
                                Contact Dispatch <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {allOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-zinc-50 border border-zinc-100 rounded-[40px] opacity-50">
                                <Truck className="w-12 h-12 text-zinc-200 mb-4" />
                                <p className="font-black uppercase tracking-widest text-[10px] text-zinc-300">No active dispatches found</p>
                            </div>
                        ) : (
                            allOrders.map((order: Order, idx: number) => (
                                <div key={idx} className="bg-white border-2 border-zinc-50 p-8 rounded-[40px] hover:border-[#D4AF37]/30 transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                                                    <Truck size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-serif font-black text-xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>TRK-{order.id.substring(0, 8).toUpperCase()}</h4>
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{order.profiles?.full_name || 'Guest'} • {order.shipping_area}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                                                <StatusPill active={order.status === 'pending'} label="Pending" />
                                                <StatusPill active={order.status === 'processing'} label="Processing" />
                                                <StatusPill active={order.status === 'shipped'} label="In Transit" />
                                                <StatusPill active={order.status === 'delivered'} label="Delivered" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center min-w-[200px]">
                                            {order.status === 'processing' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, order.user_id, 'shipped')}
                                                    className="w-full bg-[#121212] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-[#3E2723] transition-all flex items-center justify-center gap-2"
                                                >
                                                    Dispatch Scents <ArrowRight size={14} />
                                                </button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, order.user_id, 'delivered')}
                                                    className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                                >
                                                    Confirm Delivery <CheckCircle2 size={14} />
                                                </button>
                                            )}
                                            {order.status === 'pending' && (
                                                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest text-center bg-amber-50 py-3 rounded-2xl border border-amber-100 italic">Waiting for payment verification</p>
                                            )}
                                            <button className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-500 transition-colors" onClick={() => updateOrderStatus(order.id, order.user_id, 'cancelled')}>Cancel Dispatch</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {activeTab === 'support' && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[500px]">
                        <h3 className="text-2xl font-serif font-black mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            <HeadphonesIcon className="w-6 h-6 text-[#D4AF37]" /> Customer Support Tickets
                        </h3>
                        <div className="flex flex-col items-center justify-center p-10 mt-4 rounded-3xl bg-zinc-50 border border-zinc-100 opacity-50">
                            <CheckCircle2 className="w-8 h-8 text-zinc-300 mb-4" />
                            <p className="font-bold uppercase tracking-widest text-[10px] text-zinc-400">Inbox is empty. No new tickets.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'gifting' && (
                    <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[500px]">
                        <h3 className="text-2xl font-serif font-black mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            <Gift className="w-6 h-6 text-[#D4AF37]" /> Gifting Suite Requests
                        </h3>
                        <div className="flex flex-col items-center justify-center p-10 mt-4 rounded-3xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 border-dashed">
                            <Gift className="w-8 h-8 text-[#D4AF37]/50 mb-4" />
                            <p className="font-bold uppercase tracking-widest text-[10px] text-[#D4AF37]/50">No new gifting requests observed.</p>
                        </div>
                    </div>
                )}
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

function StatCard({ label, value, sub, icon, color }: { label: string, value: string, sub: string, icon: any, color: string }) {
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

function StatusPill({ active, label }: { active: boolean, label: string }) {
    return (
        <div className={`flex items-center justify-center px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${active
            ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20'
            : 'bg-zinc-50 text-zinc-300 border-zinc-100'
            }`}>
            {label}
        </div>
    );
}
