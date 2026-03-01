"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, Package, MapPin, CheckCircle, Bell, Navigation, Phone, Search } from 'lucide-react';
import MemberNavbar from '@/components/layout/MemberNavbar';

export default function DispatchDashboard() {
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkRiderAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/auth';
                return;
            }
            setUser(session.user);

            // Fetch orders assigned to this rider
            const { data: riderOrders } = await supabase
                .from('orders')
                .select('*, profiles(full_name, email, phone)')
                .eq('rider_id', session.user.id)
                .order('created_at', { ascending: false });

            if (riderOrders) setDeliveries(riderOrders);
            setLoading(false);
        };
        checkRiderAuth();
    }, []);

    const updateDeliveryStatus = async (orderId: string, status: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: status })
            .eq('id', orderId);

        if (!error) {
            setDeliveries(prev => prev.map(d => d.id === orderId ? { ...d, status } : d));
            alert(`Delivery status updated to ${status.toUpperCase()}`);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-t-[#D4AF37] rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-24">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&family=Playfair+Display:wght@900&display=swap');
                body { font-family: 'Outfit', sans-serif; }
                .font-serif { font-family: 'Playfair Display', serif; }
            `}</style>

            <MemberNavbar />

            <div className="max-w-[1400px] mx-auto pt-32 px-6">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
                            <Truck size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Courier Manifest</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-black">Dispatch Hub</h1>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
                        <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center text-[#D4AF37]">
                            <Navigation size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-400 font-black uppercase">Service Status</p>
                            <p className="text-sm font-black text-zinc-900">Active • On-Duty</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Active Jobs */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-xl font-serif font-black flex items-center gap-3">
                            Current Task List
                            <span className="text-[10px] bg-zinc-900 text-white px-3 py-1 rounded-full">{deliveries.length} Packages</span>
                        </h3>

                        {deliveries.length === 0 ? (
                            <div className="bg-white p-12 rounded-[40px] border border-zinc-100 flex flex-col items-center justify-center text-center opacity-50">
                                <Package size={48} className="text-zinc-200 mb-4" />
                                <p className="font-black uppercase text-[10px] tracking-widest text-zinc-400">No active dispatches in queue</p>
                            </div>
                        ) : (
                            deliveries.map((delivery, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-[40px] border-2 border-zinc-50 hover:border-[#D4AF37]/30 transition-all shadow-sm group">
                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-zinc-900 text-[#D4AF37] rounded-2xl flex items-center justify-center">
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-serif font-black text-xl">Order #{delivery.id.substring(0, 8).toUpperCase()}</h4>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                                                        Dest: {delivery.shipping_area || 'Central'}, {delivery.shipping_state || 'Nigeria'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                                    <MapPin size={14} className="text-[#D4AF37] mb-2" />
                                                    <p className="text-[9px] font-black text-zinc-400 uppercase">Customer Address</p>
                                                    <p className="text-xs font-bold text-zinc-900 mt-1">{delivery.shipping_address || 'Check Order Details'}</p>
                                                </div>
                                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                                    <Phone size={14} className="text-[#D4AF37] mb-2" />
                                                    <p className="text-[9px] font-black text-zinc-400 uppercase">Contact</p>
                                                    <p className="text-xs font-bold text-zinc-900 mt-1">{delivery.profiles?.phone || 'No Phone Registered'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-between items-end gap-4">
                                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${delivery.status === 'shipped' ? 'text-amber-500 border-amber-500 bg-amber-50' : 'text-emerald-500 border-emerald-500 bg-emerald-50'
                                                }`}>
                                                {delivery.status}
                                            </span>

                                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                                {delivery.status === 'shipped' && (
                                                    <button
                                                        onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                                                        className="bg-[#D4AF37] text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-900 transition-all shadow-lg shadow-[#D4AF37]/20"
                                                    >
                                                        <CheckCircle size={14} /> Confirm Delivery
                                                    </button>
                                                )}
                                                <button className="bg-zinc-100 text-zinc-900 px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-200 transition-all">
                                                    <Phone size={14} /> Call Customer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Rider Stats / Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
                            <h3 className="text-lg font-serif font-black mb-6">Logistics Profile</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase">Assigned Rider</p>
                                        <p className="text-sm font-black text-zinc-900">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-zinc-100"></div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-2xl font-black text-zinc-900">{deliveries.filter(d => d.status === 'delivered').length}</p>
                                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Completed</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-zinc-900">{deliveries.filter(d => d.status === 'shipped').length}</p>
                                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">In Transit</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 p-8 rounded-[40px] text-white">
                            <h3 className="font-serif text-xl mb-4">Dispatcher Alert</h3>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] leading-relaxed mb-6">
                                Ensure all signature scent deliveries are handled with extreme care. Request photo verification upon handoff.
                            </p>
                            <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-3">
                                <Bell className="text-[#D4AF37]" size={16} />
                                <span className="text-[9px] font-black uppercase tracking-widest">New Route Updates Available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
