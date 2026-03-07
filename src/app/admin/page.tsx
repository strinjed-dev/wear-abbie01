"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, User, Phone, MessageCircle, Truck, Settings, LogOut, Edit3, BarChart3, Clock, CheckCircle2, Search, Bell, Plus, Image as ImageIcon, Database, Menu, Lock, ShieldCheck, ArrowRight, X, Upload, HeadphonesIcon, Gift, ShoppingBag, Crown, Mail, MessageSquare, FileText } from 'lucide-react';
import { uploadImage, supabase, getSafeSession } from '@/lib/supabase';
import { useCart, Product, Order } from '@/context/CartContext';
import { syncCatalogToSupabase } from '@/app/actions/migrateImages';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

// --- Monolithic Admin Component ---

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
    const [isLoadingData, setIsLoadingData] = useState(false);
    const { orders: localOrders, setIsCartOpen } = useCart();
    const [riders, setRiders] = useState<any[]>([]);
    const [updatingDispatch, setUpdatingDispatch] = useState<string | null>(null);
    const [dispatchLocation, setDispatchLocation] = useState("");
    const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [showCacheAlert, setShowCacheAlert] = useState(false);
    const [supportTickets, setSupportTickets] = useState<any[]>([]);
    const [itemRequests, setItemRequests] = useState<any[]>([]);
    const [giftingRequests, setGiftingRequests] = useState<any[]>([]);
    const [userOrdersView, setUserOrdersView] = useState<string | null>(null);
    const [searchOrdersQuery, setSearchOrdersQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [dispatchName, setDispatchName] = useState("");
    const [dispatchPhone, setDispatchPhone] = useState("");
    const [adminUser, setAdminUser] = useState<any>(null);
    const [savingSettings, setSavingSettings] = useState(false);

    const [newProduct, setNewProduct] = useState<any>({
        name: '',
        price: 0,
        category: 'Fragrance',
        size: '100ml',
        type: 'Perfume',
        description: '',
        stock: 0,
        image_url: '',
        is_active: true,
        is_cod: true,
        original_price: ''
    });

    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    const REQUIRED_KEY = process.env.NEXT_PUBLIC_ADMIN_BOOTSTRAP_KEY || "WEAR_ABBIE_ADMIN_2026";

    const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (bootstrapKey === REQUIRED_KEY) {
            setIsAuthorized(true);
            setAuthError(false);
            localStorage.setItem("wear_abbie_admin_authorized", "true");
            const { data: { session } } = await getSafeSession();
            if (session?.user?.id) {
                // Ensure the database grants them admin RLS bypass
                await supabase.from('profiles').update({ role: 'admin' }).eq('id', session.user.id);
                // Update JWT metadata to pass RLS auth checks using auth.jwt()
                await supabase.auth.updateUser({ data: { role: 'admin' } });
            }
            setRefreshTrigger(p => p + 1);
        } else {
            setAuthError(true);
        }
    };

    const [jwtPreview, setJwtPreview] = useState<string>('');
    const [authChecking, setAuthChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session }, error } = await getSafeSession();
            if (error || !session) {
                setAuthChecking(false);
                window.location.replace('/auth'); // Require Supabase Session first
                return;
            }

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            setAdminUser({ ...session.user, profile_data: profile || {} });

            // Set Developer info securely for Admin page display
            const jwt = session.access_token;
            setJwtPreview(`${jwt.substring(0, 15)}...${jwt.substring(jwt.length - 15)}`);

            const authorized = localStorage.getItem("wear_abbie_admin_authorized");
            if (authorized === "true") {
                setIsAuthorized(true);
            }
            setAuthChecking(false);
        };
        const timer = setTimeout(() => {
            setAuthChecking(false);
        }, 5000);

        checkAuth().finally(() => clearTimeout(timer));
    }, []); // Only check on mount

    useEffect(() => {
        if (isAuthorized) {
            fetchInitialData();
        }
    }, [isAuthorized, refreshTrigger]); // Fetch data when authorized or triggered by mutations

    const fetchInitialData = async () => {
        if (!isAuthorized) return;
        setIsLoadingData(true);
        try {
            // Ensure session is active and lock is available before firing multiple queries
            // This prevents the common Navigator LockManager timeout in Supabase v2
            const { data: { session }, error: sessionError } = await getSafeSession();
            
            if (sessionError || !session) {
                console.error("Auth session not valid for data fetching", sessionError);
                return;
            }

            // Fire all primary fetches in parallel for maximum speed
            const [
                ordersRes,
                profilesRes,
                productsRes,
                ridersRes,
                supportRes,
                requestsRes,
                giftRes
            ] = await Promise.all([
                supabase.from('orders').select('*').order('created_at', { ascending: false }),
                supabase.from('profiles').select('*').order('created_at', { ascending: false }),
                supabase.from('products').select('*').order('name', { ascending: true }),
                supabase.from('profiles').select('*').eq('role', 'rider'),
                supabase.from('support_tickets').select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
                supabase.from('item_requests').select('*, profiles(full_name, email), products(name, image_url)').order('created_at', { ascending: false }),
                supabase.from('gifting_requests').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
            ]);

            // Process results individually to handle partial failures
            if (ordersRes.error) console.error('Orders fetch error:', ordersRes.error.message);
            if (ordersRes.data) setAllOrders(ordersRes.data);

            if (profilesRes.data) setUsers(profilesRes.data);
            if (productsRes.data) setProducts(productsRes.data);
            if (ridersRes.data) setRiders(ridersRes.data);
            if (supportRes.data) setSupportTickets(supportRes.data || []);
            if (requestsRes.data) setItemRequests(requestsRes.data || []);
            if (giftRes.data) setGiftingRequests(giftRes.data || []);

        } catch (error) {
            console.error("Unexpected error in fetchInitialData:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    // Real-time Admin Notifications Subscription
    useEffect(() => {
        if (!isAuthorized) return;

        // Listen for new orders
        const orderSubscription = supabase
            .channel('admin-orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload: any) => {
                const newOrder = payload.new;
                setAdminNotifications((prev: any[]) => [{
                    id: Date.now(),
                    title: "New Order Registry",
                    message: `Code: TRK-${newOrder.id.substring(0, 8).toUpperCase()}`,
                    type: "order",
                    created_at: new Date().toISOString()
                }, ...prev]);

                // Browser Notification
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("New Order Registry", { body: `TRK-${newOrder.id.substring(0, 8).toUpperCase()}`, icon: '/logo.png' });
                }

                setRefreshTrigger((p: number) => p + 1);
            })
            .subscribe();

        // Listen for new user registrations
        const userSubscription = supabase
            .channel('admin-users')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload: any) => {
                const newUser = payload.new;
                const title = "New User Onboarding";
                const msg = `${newUser.full_name || newUser.email || 'Anonymous Member'}`;

                setAdminNotifications((prev: any[]) => [{
                    id: Date.now(),
                    title: title,
                    message: msg,
                    type: "user",
                    created_at: new Date().toISOString()
                }, ...prev]);

                // Browser Notification
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(title, { body: msg, icon: '/logo.png' });
                }

                setRefreshTrigger((p: number) => p + 1);
            })
            .subscribe();

        // Listen for new support tickets
        const supportSubscription = supabase
            .channel('admin-support')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_tickets' }, (payload: any) => {
                const title = "New Support Inquiry";
                setAdminNotifications((prev: any[]) => [{
                    id: Date.now(),
                    title,
                    message: payload.new.subject,
                    type: "support",
                    created_at: new Date().toISOString()
                }, ...prev]);
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(title, { body: payload.new.subject, icon: '/logo.png' });
                }
                setRefreshTrigger((p: number) => p + 1);
            })
            .subscribe();

        // Listen for item requests
        const itemRequestSubscription = supabase
            .channel('admin-item-requests')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'item_requests' }, (payload: any) => {
                const title = "Restock Request";
                setAdminNotifications((prev: any[]) => [{
                    id: Date.now(),
                    title,
                    message: "A member has joined an item waitlist.",
                    type: "request",
                    created_at: new Date().toISOString()
                }, ...prev]);
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(title, { body: "Waitlist update received", icon: '/logo.png' });
                }
                setRefreshTrigger((p: number) => p + 1);
            })
            .subscribe();

        // Listen for gifting requests
        const giftingSubscription = supabase
            .channel('admin-gifting')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gifting_requests' }, (payload: any) => {
                const title = "New Luxury Gift Order";
                setAdminNotifications((prev: any[]) => [{
                    id: Date.now(),
                    title,
                    message: `Recipient: ${payload.new.recipient_name}`,
                    type: "gifting",
                    created_at: new Date().toISOString()
                }, ...prev]);
                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(title, { body: `Gift for ${payload.new.recipient_name}`, icon: '/logo.png' });
                }
                setRefreshTrigger((p: number) => p + 1);
            })
            .subscribe();

        // Request notification permission
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        return () => {
            supabase.removeChannel(orderSubscription);
            supabase.removeChannel(userSubscription);
            supabase.removeChannel(supportSubscription);
            supabase.removeChannel(itemRequestSubscription);
            supabase.removeChannel(giftingSubscription);
        };
    }, [isAuthorized]);

    const purgeCache = () => {
        if (!confirm("This will clear all local data, sign out all users, and reset the site cache. Continue?")) return;
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    };

    const addOrUpdateProduct = async () => {
        const payload = editingProduct || newProduct;

        let cleanDesc = payload.description || '';
        cleanDesc = cleanDesc.replace(/\n?\|\|ORIG_PRICE:\d+\|\|/g, '').trim();
        const finalDesc = payload.original_price ? `${cleanDesc}\n||ORIG_PRICE:${payload.original_price}||` : cleanDesc;

        const { error } = await supabase
            .from('products')
            .upsert({
                ...(editingProduct ? { id: editingProduct.id } : {}),
                name: payload.name,
                price: parseFloat(payload.price.toString()),
                category: payload.category,
                size: payload.size,
                type: payload.type,
                description: finalDesc,
                image_url: url || payload.image_url, // Prefer new upload URL over payload
                is_active: payload.is_active ?? true,
                is_cod: payload.is_cod ?? true,
                fragrance_notes: payload.fragrance_notes || '',
                stock: parseInt(payload.stock.toString())
            });

        if (!error) {
            alert(editingProduct ? "Product updated!" : "New product launched!");
            setEditingProduct(null);
            setNewProduct({ name: '', price: 0, category: 'Fragrance', size: '100ml', type: 'Perfume', description: '', stock: 1, image_url: '', fragrance_notes: '', is_active: true, is_cod: true, original_price: '' });
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

    const assignRider = async (orderId: string, riderId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ rider_id: riderId, dispatch_name: null, dispatch_phone: null })
            .eq('id', orderId);

        if (!error) {
            setRefreshTrigger((p: number) => p + 1);
        } else {
            alert("Assignment failed: " + error.message);
        }
    };

    const updateManualDispatch = async (orderId: string) => {
        if (!dispatchName) return alert("Please enter dispatch name");
        const { error } = await supabase
            .from('orders')
            .update({ 
                dispatch_name: dispatchName, 
                dispatch_phone: dispatchPhone,
                rider_id: null 
            })
            .eq('id', orderId);

        if (!error) {
            setUpdatingDispatch(null);
            setDispatchName("");
            setDispatchPhone("");
            setRefreshTrigger((p: number) => p + 1);
            alert("Dispatch info updated!");
        } else {
            alert("Failed to update dispatch: " + error.message);
        }
    };

    const updateOrderLocation = async (orderId: string, location: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ current_location: location })
            .eq('id', orderId);

        if (!error) {
            setUpdatingDispatch(null);
            setDispatchLocation("");
            setRefreshTrigger((p: number) => p + 1);
        } else {
            alert("Location update failed: " + error.message);
        }
    };

    const toggleStock = async (product: Product) => {
        const currentStock = parseInt((product.stock ?? 0).toString());
        const newStock = currentStock > 0 ? 0 : 50;
        const { error } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', product.id);

        if (!error) {
            setRefreshTrigger((p: number) => p + 1);
        }
    };

    const updateOrderStatus = async (orderId: string, userId?: string, newStatus?: string) => {
        if (!newStatus) return;

        // Find target order for stock logic
        const targetOrder = allOrders.find((o: Order) => o.id === orderId);

        // Stock deduction logic: Only when payment is verified (Status -> processing/shipped)
        // And ensure we don't deduct twice
        if (targetOrder && (newStatus === 'processing' || newStatus === 'shipped') && !targetOrder.stock_deducted) {
            const items = Array.isArray(targetOrder.items) ? (targetOrder.items as any[]) : [];
            for (const item of items) {
                // Fetch latest stock to be safe
                const { data: pData } = await supabase.from('products').select('stock').eq('id', item.id).maybeSingle();
                if (pData) {
                    const currentStock = Number(pData.stock) || 0;
                    const quantity = Number(item.quantity) || 1;
                    const newStock = Math.max(0, currentStock - quantity);
                    await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
                }
            }
            // Mark order as stock-deducted in DB
            await supabase.from('orders').update({ stock_deducted: true }).eq('id', orderId);
        }

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (!error) {
            const messages: Record<string, string> = {
                'processing': "Your payment has been verified! We are preparing your scent registry.",
                'shipped': "Dispatch confirmed! Your fragrance is on its way with live tracking.",
                'delivered': "Delivered & Verified. Experience the scent now!",
                'cancelled': "Transaction retracted. Contact support for assistance."
            };

            if (userId && messages[newStatus]) {
                await supabase.from('notifications').insert({
                    user_id: userId,
                    title: `ORDER UPDATE: ${newStatus.toUpperCase()}`,
                    message: messages[newStatus],
                    type: "order_update",
                    order_id: orderId
                });
            }

            // TRIGGER EMAIL
            if (targetOrder) {
                const userEmail = targetOrder.profiles?.email || targetOrder.contact_email;
                const userName = targetOrder.profiles?.full_name || targetOrder.customer_name || 'Valued Member';

                if (userEmail) {
                    try {
                        await sendOrderStatusUpdateEmail(userEmail, userName, orderId, newStatus);
                        console.log(`Status update email sent to ${userEmail}`);
                    } catch (err) {
                        console.error("Failed to send status update email:", err);
                    }
                }
            }

            setRefreshTrigger((prev: number) => prev + 1);
        } else {
            console.error("Status update error:", error);
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
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

    const [isSyncing, setIsSyncing] = useState(false);
    const handleGlobalSync = async () => {
        if (!confirm("This will upload all 587 perfumes from the local catalog to Supabase Storage and update the database. Continue?")) return;
        setIsSyncing(true);
        try {
            const result = await syncCatalogToSupabase() as any;
            if (result.success) {
                alert(`Sync Complete! Inserted: ${result.inserted}, Uploaded: ${result.uploaded}. Check console for any skipped items.`);
                console.log("Sync Results:", result);
                setRefreshTrigger((p: number) => p + 1);
            } else {
                alert("Sync failed: " + result.message);
            }
        } catch (err) {
            alert("Sync crashed. Check logs.");
        } finally {
            setIsSyncing(false);
        }
    };

    if (authChecking) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 border-4 border-zinc-100 border-t-[#D4AF37] rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-serif font-black mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Opening Dashboard</h2>
                <p className="text-zinc-500 font-medium">Please wait a moment while we load your data.</p>
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
                        <h1 className="text-3xl md:text-4xl font-serif font-black text-white mb-4 tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>Admin Access</h1>
                        <p className="text-zinc-500 font-medium">Please enter your password to authorize this session for Wear Abbie Admin Portal.</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input
                                type="password"
                                placeholder="Enter Admin Password"
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

                    <p className="mt-12 text-center text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Protected Admin Session • Port 443 Encryption</p>
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
                    <SidebarItem icon={<Users size={20} />} label="Customers" active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<Truck size={20} />} label="Dispatch" active={activeTab === 'tracking'} onClick={() => { setActiveTab('tracking'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<ShoppingBag size={20} />} label="All Orders" active={activeTab === 'all-orders'} onClick={() => { setActiveTab('all-orders'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<MessageSquare size={20} />} label="Support" active={activeTab === 'support'} onClick={() => { setActiveTab('support'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<Bell size={20} />} label="Requests" active={activeTab === 'requests'} onClick={() => { setActiveTab('requests'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<Gift size={20} />} label="Gifting" active={activeTab === 'gifting'} onClick={() => { setActiveTab('gifting'); setIsMenuOpen(false); }} />
                </nav>

                <div className="mt-auto pt-10 border-t border-white/10 space-y-3">
                    <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }} />
                    <SidebarItem icon={<LogOut size={20} />} label="Sign Out" active={false} onClick={handleLogout} />
                </div>
            </aside>

            {/* Main Admin Content */}
            <main className="flex-grow p-6 md:p-12 lg:p-16 animate-in">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-16 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Admin Session</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>Wear Abbie Admin</h1>
                        <p className="text-zinc-400 font-medium mt-2">Manage your catalog, orders and customers.</p>
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
                        <div
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="w-12 h-12 bg-white rounded-full border border-zinc-100 flex items-center justify-center relative cursor-pointer hover:bg-zinc-50 transition-colors flex-shrink-0"
                        >
                            <Bell className={`w-5 h-5 ${adminNotifications.some((n: any) => !n.read) ? 'text-[#D4AF37]' : 'text-zinc-400'}`} />
                            {adminNotifications.some((n: any) => !n.read) && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </div>
                        <button
                            onClick={() => { setActiveTab('inventory'); setEditingProduct(null); }}
                            className="flex-grow md:flex-none bg-[#D4AF37] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-[#3E2723] transition-all shadow-xl shadow-[#D4AF37]/10 flex items-center justify-center gap-3 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>
                </header>

                {isLoadingData && (
                    <div className="flex flex-col items-center justify-center py-32 opacity-50">
                        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Synchronizing Ledger...</p>
                    </div>
                )}

                {!isLoadingData && activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
                            <StatCard
                                label="Catalog Value"
                                value={`₦${products.reduce((acc: number, p: Product) => acc + (parseFloat((p.price ?? 0).toString()) * (parseInt((p.stock ?? 0).toString()) || 0)), 0).toLocaleString()}`}
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
                                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 no-scrollbar">
                                    {allOrders.slice(0, 50).map((order: Order, idx: number) => (
                                        <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border border-zinc-100 rounded-[20px] bg-white hover:shadow-lg hover:border-[#D4AF37] transition-all gap-4">
                                            <div className="flex-1 w-full">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                                    <h4 className="font-black text-[10px] uppercase tracking-widest text-zinc-400">ID: {order.id?.toString().split('-')[0] || 'N/A'}...</h4>
                                                </div>
                                                <p className="text-xs font-black text-zinc-900 mb-1">{order.profiles?.full_name || (order.contact_email ? order.contact_email.split('@')[0] : "Guest Customer")}</p>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                                                    {order.shipping_area || 'Standard'}, {order.shipping_state || 'Nigeria'} • {Array.isArray(order.items) ? (order.items as any[]).length : 0} items
                                                </p>
                                            </div>
                                            <div className="w-full md:w-auto text-left md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-50">
                                                <span className="font-serif font-bold text-lg text-[#3E2723]">₦{(Number(order.total_amount) || Number(order.total) || 0).toLocaleString()}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.status === 'pending' ? 'text-amber-500 border-amber-500 bg-amber-50' : 'text-emerald-500 border-emerald-500 bg-emerald-50'}`}>
                                                        {order.status}
                                                    </span>
                                                    {order.status === 'pending' && (
                                                        <button
                                                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); updateOrderStatus(order.id, order.user_id, 'processing'); }}
                                                            className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#D4AF37] text-white hover:bg-black transition-colors"
                                                        >
                                                            Verify
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {allOrders.length > 50 && (
                                        <p className="text-center py-6 text-[10px] font-black uppercase tracking-widest text-zinc-300">Viewing most recent 50 orders</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-12">
                        {/* Summary Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <StatCard label="Products" value={products.length.toString()} sub="Verified Items" icon={<Package size={24} />} color="border-[#D4AF37]" />
                            <StatCard label="Low Stock" value={products.filter((p: Product) => (parseInt((p.stock ?? 0).toString()) || 0) === 0).length.toString()} sub="Items needing restock" icon={<X size={24} />} color="border-red-400" />
                            <StatCard label="Total Value" value={`₦${products.reduce((acc: number, p: Product) => acc + (parseFloat((p.price ?? 0).toString()) * (parseInt((p.stock ?? 0).toString()) || 0)), 0).toLocaleString()}`} sub="Current Evaluation" icon={<BarChart3 size={24} />} color="border-emerald-400" />
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
                                            <Package size={80} />
                                        </div>
                                        <h4 className="font-serif text-2xl mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>Catalog Control</h4>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] leading-relaxed mb-6">
                                            Manage your product listings and syncing here.
                                        </p>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#D4AF37] w-[65%]"></div>
                                            </div>
                                            <span className="text-[10px] font-black">65% STOCK</span>
                                        </div>

                                        <button
                                            onClick={handleGlobalSync}
                                            disabled={isSyncing}
                                            className="w-full bg-[#D4AF37] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            <Database size={16} /> {isSyncing ? "Syncing Catalog..." : "Restore All from Catalog"}
                                        </button>
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
                                    {editingProduct ? 'Update Product' : 'Add New Product'}
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
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Price (₦)</label>
                                            <input
                                                type="number"
                                                placeholder="2500"
                                                className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-4 md:px-6 py-4 text-sm font-black text-zinc-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-200"
                                                value={editingProduct ? editingProduct.price : newProduct.price}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    editingProduct ? setEditingProduct({ ...editingProduct, price: val }) : setNewProduct({ ...newProduct, price: val });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block mb-2 px-2" title="Original price before discount">Discount Old Price (₦)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 5000"
                                                className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-4 md:px-6 py-4 text-sm font-black text-[#D4AF37] outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-200"
                                                value={editingProduct ? (editingProduct.original_price || '') : (newProduct.original_price || '')}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const val = e.target.value;
                                                    editingProduct ? setEditingProduct({ ...editingProduct, original_price: val }) : setNewProduct({ ...newProduct, original_price: val });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Stock Level</label>
                                            <input
                                                type="number"
                                                placeholder="50"
                                                className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-4 md:px-6 py-4 text-sm font-black text-zinc-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-200"
                                                value={editingProduct ? editingProduct.stock : newProduct.stock}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    editingProduct ? setEditingProduct({ ...editingProduct, stock: val }) : setNewProduct({ ...newProduct, stock: val });
                                                }}
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
                                            {["Antiperspirant", "Roll on", "Car fragrance", "Home fragrance", "Scented candles", "Perfumes", "Perfume oil", "Body mist", "Body spray", "Fragrance", "Boutique", "Oil", "Signature", "Luxe"].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-4 bg-white border border-zinc-100 rounded-2xl">
                                            <input
                                                type="checkbox"
                                                id="is_active_check"
                                                className="w-4 h-4 accent-[#D4AF37]"
                                                checked={editingProduct ? editingProduct.is_active : newProduct.is_active}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingProduct ? setEditingProduct({ ...editingProduct, is_active: e.target.checked }) : setNewProduct({ ...newProduct, is_active: e.target.checked })}
                                            />
                                            <label htmlFor="is_active_check" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Publicly Visible</label>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-white border border-zinc-100 rounded-2xl">
                                            <input
                                                type="checkbox"
                                                id="is_cod_check"
                                                className="w-4 h-4 accent-[#D4AF37]"
                                                checked={editingProduct ? editingProduct.is_cod : newProduct.is_cod}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingProduct ? setEditingProduct({ ...editingProduct, is_cod: e.target.checked }) : setNewProduct({ ...newProduct, is_cod: e.target.checked })}
                                            />
                                            <label htmlFor="is_cod_check" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Allow COD</label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Fragrance Notes (Top, Heart, Base)</label>
                                        <input
                                            type="text"
                                            placeholder="Bergamot, Jasmine, Sandalwood..."
                                            className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-sm font-black text-zinc-900 outline-none focus:border-[#D4AF37] transition-all placeholder:text-zinc-200"
                                            value={(editingProduct ? editingProduct.fragrance_notes : newProduct.fragrance_notes) || ""}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => editingProduct ? setEditingProduct({ ...editingProduct, fragrance_notes: e.target.value }) : setNewProduct({ ...newProduct, fragrance_notes: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2 px-2">Image Setup</label>
                                        <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-4">
                                            {(url || (editingProduct && editingProduct.image_url)) && (
                                                <div className="w-12 h-12 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 flex-shrink-0">
                                                    <img src={url || editingProduct?.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
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
                                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 truncate max-w-[100px]">{file ? file.name : "Select Image"}</p>
                                                <button onClick={() => handleUpload()} className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest underline disabled:opacity-50" disabled={!file || uploading}>
                                                    {uploading ? "Uploading..." : (url ? "Update Image" : "Save Image")}
                                                </button>
                                            </div>
                                            {url && (
                                                <button onClick={() => setUrl('')} className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">
                                                    Reset
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={addOrUpdateProduct}
                                        className="w-full bg-[#3E2723] text-white py-5 rounded-[20px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/10 hover:bg-black transition-all"
                                    >
                                        {editingProduct ? 'Update Product' : 'Add to Catalog'}
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
                                    <h3 className="text-xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>Product List</h3>
                                    <div className="bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100 flex items-center gap-2">
                                        <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{products.length} Products Active</span>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-4 no-scrollbar">
                                    {products.map((p: Product, idx: number) => (
                                        <div key={idx} className="flex flex-col md:flex-row items-center gap-6 p-6 border border-zinc-100 rounded-[24px] bg-white hover:shadow-2xl hover:border-[#D4AF37] transition-all group">
                                            <img src={p.image_url || '/logo.png'} className="w-20 h-20 rounded-2xl object-cover bg-zinc-50 border border-zinc-100" />
                                            <div className="flex-grow w-full md:w-auto">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`w-2 h-2 rounded-full ${(parseInt((p.stock ?? 0).toString()) > 0) ? 'bg-emerald-500' : 'bg-red-400 animate-pulse'}`}></span>
                                                    <h4 className="font-serif font-black text-lg truncate pr-4">{p.name}</h4>
                                                </div>
                                                <div className="flex flex-wrap gap-2 md:gap-3">
                                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-2 md:px-3 py-1 rounded-full">{p.type}</span>
                                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-2 md:px-3 py-1 rounded-full">{p.size}</span>
                                                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/30 px-2 md:px-3 py-1 rounded-full shrink-0">₦{parseFloat((p.price ?? 0).toString()).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-zinc-50 md:border-transparent">
                                                <button
                                                    onClick={() => {
                                                        const match = p.description?.match(/\|\|ORIG_PRICE:(\d+)\|\|/);
                                                        const orig = match ? match[1] : '';
                                                        const clean = p.description?.replace(/\n?\|\|ORIG_PRICE:\d+\|\|/g, '').trim();
                                                        setEditingProduct({ ...p, original_price: orig, description: clean });
                                                    }}
                                                    className="flex-1 md:flex-none p-3 bg-zinc-50 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors flex items-center justify-center"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => toggleStock(p)}
                                                    className={`flex-1 md:flex-none p-3 rounded-xl transition-all flex items-center justify-center ${(parseInt((p.stock ?? 0).toString()) > 0) ? 'bg-zinc-50 text-zinc-400 hover:text-[#D4AF37]' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}
                                                    title="Toggle Stock Level"
                                                >
                                                    <Package size={18} />
                                                </button>
                                                <button
                                                    onClick={() => p.id && deleteProduct(p.id)}
                                                    className="flex-1 md:flex-none p-3 bg-red-50 rounded-xl text-red-300 hover:text-red-500 transition-colors flex items-center justify-center"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {products.length === 0 && (
                                        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-zinc-100 rounded-[30px] opacity-50">
                                            <Package className="w-8 h-8 text-zinc-300 mb-4" />
                                            <p className="font-black uppercase text-[10px] tracking-widest text-zinc-400">No products found in the catalog</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
                }

                {
                    activeTab === 'users' && (
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[500px]">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                                <div>
                                    <h3 className="text-2xl font-serif font-black mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>Customer Management</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Manage Users, Badges & Locations</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-zinc-50 px-6 py-3 rounded-full border border-zinc-100">
                                        <span className="text-xs font-black text-[#D4AF37]">{users.length} USERS</span>
                                    </div>
                                    <div className="bg-[#D4AF37]/10 px-6 py-3 rounded-full border border-[#D4AF37]/20">
                                        <span className="text-xs font-black text-[#D4AF37]">{users.filter((u: any) => u.is_premium).length} PREMIUM</span>
                                    </div>
                                </div>
                            </div>

                            {/* User Search */}
                            <div className="mb-8">
                                <input
                                    type="text"
                                    placeholder="Search users by name, email, or location..."
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37] transition-colors"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const q = e.target.value.toLowerCase();
                                        if (!q) { fetchInitialData(); return; }
                                        setUsers((prev: any[]) => prev.filter((u: any) =>
                                            (u.full_name || '').toLowerCase().includes(q) ||
                                            (u.email || '').toLowerCase().includes(q) ||
                                            (u.location || '').toLowerCase().includes(q)
                                        ));
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[800px] overflow-y-auto pr-2 no-scrollbar">
                                {users.filter((u: any) => u.full_name || u.email).slice(0, 100).map((u: any, idx: number) => (
                                    <div key={idx} className="p-6 border border-zinc-100 rounded-[30px] bg-zinc-50/30 hover:shadow-xl hover:border-[#D4AF37]/50 transition-all group relative overflow-hidden">
                                        {/* Premium Badge Indicator */}
                                        {u.is_premium && (
                                            <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-yellow-300 text-[#3E2723] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                                                <Crown size={10} /> Premium
                                            </div>
                                        )}

                                        {/* User Header */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${u.is_premium ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 text-[#D4AF37]' : 'bg-white border-zinc-100 text-zinc-400'}`}>
                                                <Users size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-sm uppercase tracking-wider text-zinc-900 truncate">{u.full_name || (u.email ? u.email.split('@')[0] : 'Member #' + u.id.substring(0, 5))}</h4>
                                                <p className="text-[10px] font-bold text-zinc-400 mt-0.5 truncate flex items-center gap-1">
                                                    <Mail size={10} /> {u.email || 'No email'}
                                                </p>
                                            </div>
                                        </div>
                                        ... (truncated)

                                        {/* User Details */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-zinc-300">Joined</span>
                                                <span className="text-zinc-500">{new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-zinc-300">Role</span>
                                                <select
                                                    value={u.role || 'user'}
                                                    onChange={async (e: React.ChangeEvent<HTMLSelectElement>) => {
                                                        const newRole = e.target.value;
                                                        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', u.id);
                                                        if (!error) {
                                                            setUsers((prev: any[]) => prev.map((user: any) => user.id === u.id ? { ...user, role: newRole } : user));
                                                        } else { alert('Failed to update role: ' + error.message); }
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase cursor-pointer outline-none border ${u.role === 'admin' ? 'bg-[#3E2723] text-[#D4AF37] border-[#3E2723]' : u.role === 'rider' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-zinc-500 border-zinc-200'}`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="rider">Rider</option>
                                                </select>
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-zinc-300">Location</span>
                                                <span className="text-zinc-500 truncate max-w-[150px]">{u.location || '—'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-zinc-300">Phone</span>
                                                <span className="text-zinc-500">{u.phone || '—'}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3 pt-4 border-t border-zinc-100">
                                            {/* Premium Badge Toggle */}
                                            <button
                                                onClick={async () => {
                                                    const newPremium = !u.is_premium;
                                                    const { error } = await supabase.from('profiles').update({ is_premium: newPremium }).eq('id', u.id);
                                                    if (!error) {
                                                        setUsers((prev: any[]) => prev.map((user: any) => user.id === u.id ? { ...user, is_premium: newPremium } : user));
                                                    } else { alert('Failed to update premium status: ' + error.message); }
                                                }}
                                                className={`w-full py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 ${u.is_premium ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200' : 'bg-zinc-50 text-zinc-400 border border-zinc-100 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'}`}
                                            >
                                                <Crown size={12} />
                                                {u.is_premium ? 'Remove Premium Badge' : 'Grant Premium Badge'}
                                            </button>

                                            {/* Set Location */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder={u.location || "Set location..."}
                                                    className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-[10px] font-bold outline-none focus:border-[#D4AF37]"
                                                    id={`loc-${u.id}`}
                                                />
                                                <button
                                                    onClick={async () => {
                                                        const input = document.getElementById(`loc-${u.id}`) as HTMLInputElement;
                                                        const val = input?.value?.trim();
                                                        if (!val) return;
                                                        const { error } = await supabase.from('profiles').update({ location: val }).eq('id', u.id);
                                                        if (!error) {
                                                            setUsers((prev: any[]) => prev.map((user: any) => user.id === u.id ? { ...user, location: val } : user));
                                                            input.value = '';
                                                        } else { alert('Failed to set location: ' + error.message); }
                                                    }}
                                                    className="bg-[#D4AF37] text-white px-4 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#3E2723] transition-colors"
                                                >
                                                    Set
                                                </button>
                                            </div>

                                            {/* WhatsApp Contact */}
                                            {u.phone && (
                                                <a
                                                    href={`https://wa.me/${u.phone?.replace(/\D/g, '')}?text=Hello ${u.full_name || ''}, this is Wear Abbie admin.`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full py-2.5 rounded-2xl font-black uppercase tracking-widest text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    <MessageSquare size={12} /> WhatsApp User
                                                </a>
                                            )}

                                            <button
                                                onClick={() => setUserOrdersView(userOrdersView === u.id ? null : u.id)}
                                                className="w-full py-2.5 rounded-2xl font-black uppercase tracking-widest text-[9px] bg-zinc-50 text-zinc-600 border border-zinc-100 hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                <ShoppingBag size={12} /> {userOrdersView === u.id ? 'Hide Orders' : 'View Member Orders'}
                                            </button>

                                            {userOrdersView === u.id && (
                                                <div className="mt-6 pt-6 border-t border-zinc-50 space-y-4 animate-in">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-300">Order History</p>
                                                    {allOrders.filter((o: Order) => o.user_id === u.id).length === 0 ? (
                                                        <p className="text-[9px] font-bold text-zinc-400 italic">No orders recorded.</p>
                                                    ) : (
                                                        allOrders.filter((o: Order) => o.user_id === u.id).map((order: Order) => (
                                                            <div key={order.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="text-[10px] font-black text-zinc-900">#TRK-{order.id.slice(-6).toUpperCase()}</span>
                                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                        {order.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9px] font-bold text-zinc-500 mb-1">₦{order.total?.toLocaleString()}</p>
                                                                <p className="text-[8px] font-medium text-zinc-400">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date N/A'}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {users.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                    <Users size={48} className="text-zinc-200 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">No users found</p>
                                </div>
                            )}
                        </div>
                    )
                }

                {activeTab === 'tracking' && (
                    <div className="space-y-8 animate-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h3 className="text-2xl font-serif font-black mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>Manage Shipments</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Fulfillment & Tracking</p>
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
                            {allOrders.filter(o => (updatingDispatch === o.id) || (o.status !== 'delivered' && o.status !== 'cancelled')).length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-20 bg-zinc-50 border border-zinc-100 rounded-[40px] opacity-50">
                                    <Truck className="w-12 h-12 text-zinc-200 mb-4" />
                                    <p className="font-black uppercase tracking-widest text-[10px] text-zinc-300">No active dispatches found</p>
                                </div>
                            ) : (
                                allOrders.filter(o => (updatingDispatch === o.id) || (o.status !== 'delivered' && o.status !== 'cancelled')).map((order: Order, idx: number) => (
                                    <div key={idx} className="bg-white border-2 border-zinc-50 p-8 rounded-[40px] hover:border-[#D4AF37]/30 transition-all group">
                                        <div className="flex flex-col md:flex-row justify-between gap-8">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                                                        <Truck size={24} />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-serif font-black text-xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>{order.tracking_code || `TRK-${order.id.substring(0, 8).toUpperCase()}`}</h4>
                                                            <a
                                                                href={`https://wa.me/${(order.profiles?.phone || order.phone || '').replace(/\D/g, '')}`}
                                                                target="_blank"
                                                                className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-500 hover:text-white transition-all"
                                                            >
                                                                <MessageSquare size={14} />
                                                            </a>
                                                        </div>
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                            {order.profiles?.full_name || order.profiles?.email || order.contact_email || 'Guest Member'} • {order.shipping_area}
                                                        </p>

                                                        {/* Ordered Items Preview */}
                                                        <div className="flex flex-wrap gap-2 mt-4">
                                                            {order.items?.map((item: any, i: number) => (
                                                                <div key={i} className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                                                                    <img src={item.image || '/logo.png'} alt="" className="w-6 h-6 object-contain" />
                                                                    <span className="text-[9px] font-black uppercase text-zinc-900">{item.name} <span className="text-zinc-300">x{item.quantity}</span></span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                                                    <StatusPill active={order.status === 'pending'} label="Pending" />
                                                    <StatusPill active={order.status === 'processing'} label="Processing" />
                                                    <StatusPill active={order.status === 'shipped'} label="In Transit" />
                                                    <StatusPill active={order.status === 'delivered'} label="Delivered" />
                                                </div>

                                                {/* Dispatch Management Area */}
                                                {order.status !== 'pending' && (
                                                    <div className="pt-6 border-t border-zinc-50 space-y-4">
                                                        <div className="flex flex-col md:flex-row items-end gap-4 bg-zinc-50/50 p-6 rounded-[30px] border border-zinc-100">
                                                            <div className="flex-1 space-y-4">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block tracking-widest px-2">Assigned Rider (Select)</label>
                                                                        <select
                                                                            className="w-full bg-white border border-zinc-100 rounded-2xl px-5 py-4 text-xs font-black shadow-sm outline-none focus:border-[#D4AF37] transition-all"
                                                                            value={order.rider_id || ""}
                                                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => assignRider(order.id, e.target.value)}
                                                                        >
                                                                            <option value="">Select Rider...</option>
                                                                            {riders.map((r: any) => (
                                                                                <option key={r.id} value={r.id}>{r.full_name || r.email}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                    <div className="relative group">
                                                                        <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block tracking-widest px-2">Manual Dispatch Name</label>
                                                                        <input 
                                                                            type="text" 
                                                                            placeholder="e.g. John Courier"
                                                                            className="w-full bg-white border border-zinc-100 rounded-2xl px-5 py-4 text-xs font-black shadow-sm outline-none focus:border-[#D4AF37] transition-all"
                                                                            value={updatingDispatch === order.id ? dispatchName : (order.dispatch_name || "")}
                                                                            onFocus={() => {
                                                                                setUpdatingDispatch(order.id);
                                                                                setDispatchName(order.dispatch_name || "");
                                                                                setDispatchPhone(order.dispatch_phone || "");
                                                                            }}
                                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDispatchName(e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block tracking-widest px-2">Dispatch Phone</label>
                                                                        <input 
                                                                            type="text" 
                                                                            placeholder="e.g. 08123456789"
                                                                            className="w-full bg-white border border-zinc-100 rounded-2xl px-5 py-4 text-xs font-black shadow-sm outline-none focus:border-[#D4AF37] transition-all"
                                                                            value={updatingDispatch === order.id ? dispatchPhone : (order.dispatch_phone || "")}
                                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDispatchPhone(e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block tracking-widest px-2">Current Location</label>
                                                                        <div className="flex gap-2">
                                                                            <input
                                                                                type="text"
                                                                                placeholder={order.current_location || "e.g. Near Lagos Island"}
                                                                                className="flex-1 bg-white border border-zinc-100 rounded-2xl px-5 py-4 text-xs font-black shadow-sm outline-none focus:border-[#D4AF37] transition-all"
                                                                                value={updatingDispatch === order.id ? dispatchLocation : (order.current_location || "")}
                                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDispatchLocation(e.target.value)}
                                                                            />
                                                                            {updatingDispatch === order.id && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (dispatchLocation !== order.current_location) updateOrderLocation(order.id, dispatchLocation);
                                                                                        if (dispatchName !== order.dispatch_name || dispatchPhone !== order.dispatch_phone) updateManualDispatch(order.id);
                                                                                    }}
                                                                                    className="bg-[#D4AF37] text-white px-6 rounded-2xl text-[9px] font-black uppercase hover:bg-black transition-all"
                                                                                >
                                                                                    Save
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
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
                                                    <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 border-dashed">
                                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest text-center italic mb-4">Awaiting PalmPay Verification</p>
                                                        <button
                                                            onClick={() => updateOrderStatus(order.id, order.user_id, 'processing')}
                                                            className="w-full bg-[#D4AF37] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-black transition-all flex items-center justify-center gap-2"
                                                        >
                                                            Confirm & Deduct Stock <CheckCircle2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                                <button className="text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-500 transition-colors" onClick={() => updateOrderStatus(order.id, order.user_id, 'cancelled')}>Cancel Dispatch</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'all-orders' && (
                    <div className="space-y-8 animate-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h3 className="text-2xl font-serif font-black mb-1" style={{ fontFamily: 'var(--font-playfair), serif' }}>Order Registry</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Master Record of all transactions</p>
                            </div>
                            <div className="flex flex-wrap gap-4 w-full md:w-auto">
                                <div className="flex items-center bg-zinc-100 px-6 py-3 rounded-full border border-zinc-200 focus-within:bg-white focus-within:border-[#D4AF37] transition-all w-full md:w-80">
                                    <Search className="w-4 h-4 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="SEARCH BY NAME, EMAIL OR ID..."
                                        className="bg-transparent border-none outline-none text-[10px] ml-4 w-full font-black uppercase tracking-widest text-zinc-900"
                                        value={searchOrdersQuery}
                                        onChange={(e) => setSearchOrdersQuery(e.target.value)}
                                    />
                                </div>
                                <button className="bg-zinc-900 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-black transition-all flex items-center gap-2" onClick={() => alert("Digital archive generated safely.")}>
                                    <Database size={14} className="text-[#D4AF37]" /> Export Storage
                                </button>
                            </div>
                        </div>

                        {/* Order Registry Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm hover:border-[#D4AF37]/20 transition-all group">
                                <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/10 transition-colors">
                                    <ShoppingBag size={14} className="text-zinc-400 group-hover:text-[#D4AF37]" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Orders</p>
                                <p className="text-2xl font-black">{allOrders.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm hover:border-[#D4AF37]/20 transition-all group">
                                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Delivered</p>
                                <p className="text-2xl font-black">{allOrders.filter(o => o.status === 'delivered').length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm hover:border-[#D4AF37]/20 transition-all group">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                    <Clock size={14} className="text-blue-500" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">In Pipeline</p>
                                <p className="text-2xl font-black">{allOrders.filter(o => o.status === 'processing' || o.status === 'shipped').length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm hover:border-[#D4AF37]/20 transition-all group">
                                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                                    <Database size={14} className="text-amber-500" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Registry Value</p>
                                <p className="text-2xl font-black overflow-hidden truncate">₦{allOrders.reduce((sum, o) => sum + (Number(o.total_amount) || Number(o.total) || 0), 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] shadow-sm border border-zinc-100 overflow-hidden">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-100/50 border-b-2 border-zinc-100">
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-left">Execution Ref</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-left">Customer / ID</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-left">Item Manifest</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-left">Revenue</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-left">Pipeline status</th>
                                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Strategic Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {allOrders.filter(o =>
                                            !searchOrdersQuery ||
                                            o.profiles?.full_name?.toLowerCase().includes(searchOrdersQuery.toLowerCase()) ||
                                            o.profiles?.email?.toLowerCase().includes(searchOrdersQuery.toLowerCase()) ||
                                            o.contact_email?.toLowerCase().includes(searchOrdersQuery.toLowerCase()) ||
                                            o.contact_phone?.toLowerCase().includes(searchOrdersQuery.toLowerCase()) ||
                                            o.tracking_code?.toLowerCase().includes(searchOrdersQuery.toLowerCase()) ||
                                            o.id.includes(searchOrdersQuery)
                                        ).map((order: any) => (
                                            <tr key={order.id} className="group hover:bg-zinc-50/70 transition-all duration-300">
                                                <td className="px-8 py-8">
                                                    <div className="space-y-1">
                                                        <p className="font-serif font-black text-sm text-zinc-900" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                                            {order.tracking_code || `ORD-${order.id.substring(0, 8).toUpperCase()}`}
                                                        </p>
                                                        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">
                                                            {new Date(order.created_at || order.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-[11px] font-black uppercase text-zinc-900 truncate max-w-[150px]">
                                                            {order.profiles?.full_name || 'Guest Member'}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-zinc-400 break-all max-w-[150px]">
                                                            {order.contact_email || order.profiles?.email || 'N/A'}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[8px] font-black bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                                {order.shipping_area || 'Standard'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex -space-x-4 group-hover:space-x-1 transition-all">
                                                            {order.items?.map((item: any, i: number) => (
                                                                <div key={i} className="w-10 h-10 rounded-xl bg-white border border-zinc-200 p-1 shadow-sm ring-4 ring-white overflow-hidden group/item relative hover:scale-110 transition-transform hover:z-20">
                                                                    <img src={item.image || item.image_url || '/logo.png'} className="w-full h-full object-contain" alt="" />
                                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-opacity">
                                                                        <span className="text-[7px] text-white font-black uppercase">x{item.quantity}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-[8px] font-black text-[#D4AF37] uppercase tracking-tighter">
                                                            {(order.items?.length || 0)} {(order.items?.length || 0) === 1 ? 'UNIQUE ITEM' : 'UNIQUE ITEMS'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <p className="font-serif font-black text-sm text-zinc-950">
                                                        ₦{(Number(order.total_amount || order.total) || 0).toLocaleString()}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${order.payment_status === 'completed' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37]">{order.payment_method || 'PENDING'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full border shadow-sm inline-block min-w-[120px] text-center ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                                            order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                'bg-zinc-100 text-zinc-400 border-zinc-100 opacity-60'
                                                        }`}>
                                                        {order.status || 'PENDING'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="h-11 px-6 bg-zinc-50 text-zinc-900 border border-zinc-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm"
                                                        >
                                                            View Details
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setUpdatingDispatch(order.id);
                                                                setActiveTab('tracking');
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                            className="h-11 px-8 bg-zinc-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all shadow-xl shadow-black/10 hover:-translate-y-0.5"
                                                        >
                                                            Manage
                                                        </button>

                                                        <a
                                                            href={`https://wa.me/${(order.profiles?.phone || order.contact_phone || order.phone || '2348132484859').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.profiles?.full_name || 'Guest'}! I'm reaching out from Wear Abbie regarding your order ${order.tracking_code || order.id.substring(0, 8)}. Do let me know if you need assistance.`)}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="h-11 w-11 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 group-hover:scale-105"
                                                            title="Direct WhatsApp"
                                                        >
                                                            <MessageSquare size={16} />
                                                        </a>

                                                        <button
                                                            onClick={() => {
                                                                const text = `Order: ${order.tracking_code}\nItems: ${order.items?.map((i: any) => `${i.name} x${i.quantity}`).join(', ')}\nTotal: ₦${(order.total_amount || order.total).toLocaleString()}\nMethod: ${order.payment_method}`;
                                                                navigator.clipboard.writeText(text);
                                                                alert('Order metadata stored for export.');
                                                            }}
                                                            className="h-11 w-11 flex items-center justify-center bg-zinc-100 text-zinc-400 rounded-xl hover:bg-zinc-200 transition-all"
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {allOrders.length === 0 && (
                                    <div className="p-20 text-center opacity-30">
                                        <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No orders in registry yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {
                    activeTab === 'support' && (
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[500px]">
                            <h3 className="text-2xl font-serif font-black mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                <MessageSquare className="w-6 h-6 text-[#D4AF37]" /> Customer Support Tickets
                            </h3>
                            <div className="space-y-4">
                                {supportTickets.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-10 mt-4 rounded-3xl bg-zinc-50 border border-zinc-100 opacity-50">
                                        <CheckCircle2 className="w-8 h-8 text-zinc-300 mb-4" />
                                        <p className="font-bold uppercase tracking-widest text-[10px] text-zinc-400">Inbox is empty. No new tickets.</p>
                                    </div>
                                ) : (
                                    supportTickets.map((ticket: any) => (
                                        <div key={ticket.id} className="p-6 border border-zinc-100 rounded-3xl bg-zinc-50/50 hover:bg-white transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-serif font-bold text-lg mb-1">{ticket.subject}</h4>
                                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{ticket.profiles?.full_name || ticket.profiles?.email || 'Unknown Member'}</p>
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${ticket.status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-zinc-600 leading-relaxed mb-4">{ticket.message}</p>
                                            {ticket.status === 'open' && (
                                                <button
                                                    onClick={async () => {
                                                        const { error } = await supabase.from('support_tickets').update({ status: 'resolved' }).eq('id', ticket.id);
                                                        if (!error) setRefreshTrigger((p: number) => p + 1);
                                                    }}
                                                    className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-black transition-colors"
                                                >
                                                    Mark as Resolved
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'requests' && (
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[500px]">
                            <h3 className="text-2xl font-serif font-black mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                <Bell className="w-6 h-6 text-[#D4AF37]" /> Restock Requests (Waitlist)
                            </h3>
                            <div className="space-y-4">
                                {itemRequests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-10 mt-4 rounded-3xl bg-zinc-50 border border-zinc-100 opacity-50">
                                        <Bell className="w-8 h-8 text-zinc-300 mb-4" />
                                        <p className="font-bold uppercase tracking-widest text-[10px] text-zinc-400">No pending restock requests.</p>
                                    </div>
                                ) : (
                                    itemRequests.map((req: any) => (
                                        <div key={req.id} className="flex items-center justify-between p-6 border border-zinc-100 rounded-3xl bg-zinc-50/50">
                                            <div className="flex items-center gap-6">
                                                <img src={req.products?.image_url} className="w-12 h-12 object-contain bg-white rounded-xl shadow-sm p-1" />
                                                <div>
                                                    <h4 className="font-black text-sm">{req.products?.name}</h4>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Requested by: {req.profiles?.full_name || req.profiles?.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const { error } = await supabase.from('item_requests').update({ status: 'notified' }).eq('id', req.id);
                                                    if (!error) setRefreshTrigger((p: number) => p + 1);
                                                }}
                                                className="bg-zinc-900 text-[#D4AF37] px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                            >
                                                Mark Notified
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                }

                {/* Notification Drawer - Visual Implementation */}
                {
                    isNotificationOpen && (
                        <div className="fixed inset-0 md:inset-auto md:right-16 md:top-32 w-full md:w-96 bg-white shadow-2xl rounded-none md:rounded-[32px] border border-zinc-100 z-[100] flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="p-6 border-b border-zinc-50 flex justify-between items-center">
                                <div>
                                    <h4 className="font-serif font-black text-xl" style={{ fontFamily: 'var(--font-playfair), serif' }}>Admin Pulse</h4>
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Real-time alerts</p>
                                </div>
                                <button onClick={() => setIsNotificationOpen(false)} className="p-2 hover:bg-zinc-50 rounded-full">
                                    <X size={20} className="text-zinc-400" />
                                </button>
                            </div>
                            <div className="flex-grow overflow-y-auto max-h-[500px] p-4 space-y-3 no-scrollbar">
                                {adminNotifications.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <Bell className="w-8 h-8 text-zinc-100 mx-auto mb-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">No new alerts</p>
                                    </div>
                                ) : (
                                    adminNotifications.map((notif: any) => (
                                        <div key={notif.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.type === 'order' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-blue-50 text-blue-500'}`}>
                                                {notif.type === 'order' ? <ShoppingBag size={18} /> : <Users size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{notif.title}</p>
                                                <p className="text-xs font-black text-zinc-900 mb-1 truncate">{notif.message}</p>
                                                <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">{notif.created_at ? new Date(notif.created_at).toLocaleTimeString() : 'Just now'}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 border-t border-zinc-50">
                                <button
                                    onClick={() => setAdminNotifications([])}
                                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-black transition-colors"
                                >
                                    Clear all alerts
                                </button>
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'gifting' && (
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[500px]">
                            <h3 className="text-2xl font-serif font-black mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                <Gift className="w-6 h-6 text-[#D4AF37]" /> Gifting Suite Requests
                            </h3>
                            <div className="space-y-4">
                                {giftingRequests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-10 mt-4 rounded-3xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 border-dashed">
                                        <Gift className="w-8 h-8 text-[#D4AF37]/50 mb-4" />
                                        <p className="font-bold uppercase tracking-widest text-[10px] text-[#D4AF37]/50 text-center">Your elite gifting suite is clear.<br />No pending requests.</p>
                                    </div>
                                ) : (
                                    giftingRequests.map((gift: any) => (
                                        <div key={gift.id} className="p-8 border-2 border-zinc-50 rounded-[40px] bg-white group hover:border-[#D4AF37]/30 transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h4 className="font-serif font-black text-xl mb-1">Gift for {gift.recipient_name}</h4>
                                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Ordered by: {gift.profiles?.full_name || gift.profiles?.email}</p>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${gift.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-zinc-900 text-[#D4AF37]'}`}>
                                                    {gift.status}
                                                </span>
                                            </div>
                                            <div className="p-6 bg-zinc-50 rounded-2xl mb-6">
                                                <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-widest">Gift Message</p>
                                                <p className="text-sm italic font-medium">"{gift.gift_message || 'No message provided'}"</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="font-serif font-black text-lg">₦{gift.total_amount.toLocaleString()}</p>
                                                <button className="bg-zinc-900 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-all">Manage Request</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'settings' && adminUser && (
                        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-zinc-100 min-h-[500px]">
                            <h3 className="text-2xl font-serif font-black mb-2 flex items-center gap-3" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                <Settings className="w-6 h-6 text-[#D4AF37]" /> Administrator Preferences
                            </h3>
                            <p className="text-zinc-500 text-sm font-medium mb-10">Manage your administrative contact and personal details.</p>

                            <form className="space-y-6 max-w-2xl" onSubmit={async (e) => {
                                e.preventDefault();
                                setSavingSettings(true);
                                const form = e.target as HTMLFormElement;
                                const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value;
                                const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
                                const address = (form.elements.namedItem('address') as HTMLTextAreaElement).value;
                                const theme = (form.elements.namedItem('theme') as HTMLSelectElement).value;

                                if (adminUser?.id) {
                                    try {
                                        const updateFields: any = {
                                            full_name: fullName,
                                            phone: phone,
                                            address: address, // Default attempt with 'address'
                                            location: address // Also set 'location' for compatibility
                                        };

                                        let { error } = await supabase.from('profiles').update(updateFields).eq('id', adminUser.id);

                                        // If 'address' column is missing, retry without it (only using 'location')
                                        if (error && error.message.includes('column "address"')) {
                                            console.warn("Retrying profile update without 'address' column...");
                                            delete updateFields.address;
                                            const retry = await supabase.from('profiles').update(updateFields).eq('id', adminUser.id);
                                            error = retry.error;
                                        }

                                        if (!error) {
                                            // Update user metadata for theme
                                            await supabase.auth.updateUser({
                                                data: { theme_preference: theme }
                                            });
                                            
                                            // Update local state to reflect changes immediately
                                            setAdminUser((prev: any) => ({
                                                ...prev,
                                                profile_data: {
                                                    ...(prev?.profile_data || {}),
                                                    full_name: fullName,
                                                    phone: phone,
                                                    address: address,
                                                    location: address
                                                },
                                                user_metadata: {
                                                    ...(prev?.user_metadata || {}),
                                                    theme_preference: theme
                                                }
                                            }));

                                            // Trigger a local storage / DOM update for theme
                                            if (theme === 'dark') {
                                                document.documentElement.classList.add('dark');
                                                localStorage.setItem('theme', 'dark');
                                            } else if (theme === 'light') {
                                                document.documentElement.classList.remove('dark');
                                                localStorage.setItem('theme', 'light');
                                            } else {
                                                localStorage.removeItem('theme');
                                                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                                                    document.documentElement.classList.add('dark');
                                                } else {
                                                    document.documentElement.classList.remove('dark');
                                                }
                                            }

                                            alert("Admin settings updated successfully. Reloading to apply theme...");
                                            window.location.reload();
                                        } else {
                                            alert("Failed to save settings: " + error.message);
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert("An unexpected error occurred.");
                                    }
                                }
                                setSavingSettings(false);
                            }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Full Name</label>
                                        <input defaultValue={adminUser?.profile_data?.full_name || adminUser?.user_metadata?.full_name} name="fullName" type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-zinc-900" placeholder="Admin Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email (Read Only)</label>
                                        <input defaultValue={adminUser?.email} disabled type="email" className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium text-zinc-400 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Phone Number</label>
                                    <input defaultValue={adminUser?.profile_data?.phone || ""} name="phone" type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-zinc-900" placeholder="+234 XXX XXXX" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Contact Address</label>
                                    <textarea defaultValue={adminUser?.profile_data?.address || ""} name="address" rows={3} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-all text-zinc-900 resize-none" placeholder="HQ Address"></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Theme Preference</label>
                                    <select name="theme" defaultValue={adminUser?.user_metadata?.theme_preference || "system"} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-[#D4AF37] focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-white">
                                        <option value="system">System Default</option>
                                        <option value="light">Light Mode</option>
                                        <option value="dark">Dark Mode</option>
                                    </select>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                    <button disabled={savingSettings} type="submit" className="w-full sm:w-auto bg-[#D4AF37] text-black py-5 px-10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-[#D4AF37]/20 disabled:opacity-50 flex items-center justify-center gap-3">
                                        {savingSettings ? "Saving Settings..." : "Save Admin Settings"}
                                        {!savingSettings && <ShieldCheck className="w-4 h-4" />}
                                    </button>
                                    {savingSettings && (
                                        <span className="text-[10px] font-bold text-[#D4AF37] animate-pulse uppercase tracking-widest">Applying registry changes...</span>
                                    )}
                                </div>
                            </form>
                        </div>
                    )
                }
            </main>

            {/* --- Order Manifest Modal --- */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative border border-zinc-100">
                        {/* Header */}
                        <div className="p-8 md:p-12 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
                            <div>
                                <h3 className="text-2xl font-serif font-black tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>Order Manifest</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mt-1">{selectedOrder.tracking_code || "REF: " + selectedOrder.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="h-12 w-12 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm border border-zinc-100">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-8 md:p-12 max-h-[60vh] overflow-y-auto no-scrollbar space-y-10">
                            {/* Customer Identity */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><User size={12} /> Customer Identity</p>
                                <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <p className="text-lg font-black">{selectedOrder.profiles?.full_name || 'Guest Member'}</p>
                                        <p className="text-xs font-bold text-zinc-400 truncate max-w-[200px]">{selectedOrder.contact_email || selectedOrder.profiles?.email || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a 
                                            href={`tel:${selectedOrder.contact_phone || selectedOrder.profiles?.phone || ''}`} 
                                            className="h-10 px-6 bg-[#3E2723] text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
                                        >
                                            <Phone size={12} /> Call Now
                                        </a>
                                        <a 
                                           href={`https://wa.me/${(selectedOrder.contact_phone || selectedOrder.profiles?.phone || '2348132484859').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${selectedOrder.profiles?.full_name || 'Guest'}! I'm reaching out from Wear Abbie regarding your order ${selectedOrder.tracking_code || (selectedOrder.id && selectedOrder.id.substring(0, 8).toUpperCase())}.`)}`}
                                           target="_blank" rel="noreferrer"
                                           className="h-10 w-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all"
                                        >
                                            <MessageCircle size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Deployment Location */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Truck size={12} /> Deployment Location</p>
                                <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-100">
                                    <p className="text-xs font-bold text-zinc-800 leading-relaxed font-mono">
                                        {selectedOrder.shipping_address || selectedOrder.profiles?.address || selectedOrder.profiles?.location || 'Standard Shipping Registry'}<br />
                                        {selectedOrder.shipping_area || ''}, {selectedOrder.shipping_state || ''}
                                    </p>
                                </div>
                            </div>

                            {/* Item Manifest */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><ShoppingBag size={12} /> Item Manifest</p>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-zinc-50 rounded-xl p-1.5 flex items-center justify-center">
                                                    <img src={item.image || item.image_url || '/logo.png'} className="max-w-full max-h-full object-contain" alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-zinc-900">{item.name}</p>
                                                    <p className="text-[9px] font-bold text-zinc-400 uppercase">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-black">₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dispatch Information */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Database size={12} /> Dispatch Information</p>
                                <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-100 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Status</p>
                                        <span className="text-[10px] font-black uppercase text-[#D4AF37]">{selectedOrder.status}</span>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Rider / Personnel</p>
                                        <p className="text-[10px] font-black">{selectedOrder.dispatch_name || 'System Dispatch'}</p>
                                        {selectedOrder.dispatch_phone && <p className="text-[8px] text-zinc-400 font-bold">{selectedOrder.dispatch_phone}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 md:p-12 bg-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Registry Value</p>
                                <p className="text-3xl font-serif font-black text-white" style={{ fontFamily: 'var(--font-playfair), serif' }}>₦{(Number(selectedOrder.total_amount || selectedOrder.total) || 0).toLocaleString()}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="w-full md:w-auto px-12 py-5 bg-[#D4AF37] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl shadow-[#D4AF37]/10"
                            >
                                Close Manifest
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
        <div className={`flex items-center justify-center px-4 py-2 rounded-xl border text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${active
            ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20'
            : 'bg-zinc-50 text-zinc-300 border-zinc-100'
            }`}>
            {label}
        </div>
    );
}
