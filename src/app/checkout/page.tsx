"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronLeft, CreditCard, Truck, ShieldCheck, ArrowRight, X, Heart, MapPin, Phone, Mail, User } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { deliveryPricing, getDeliveryCost } from '@/utils/deliveryPricing';

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const { cart, placeOrder, isInitialized } = useCart();
    const [customer, setCustomer] = useState({ firstName: '', lastName: '', state: 'Lagos', area: '', address: '', email: '', phone: '' });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'palmpay'>('paystack');

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            if (session?.user) {
                setCustomer((prev: any) => ({ ...prev, email: session.user.email || '', firstName: session.user.user_metadata?.full_name || '' }));
                setPaymentMethod('paystack');
            } else {
                setPaymentMethod('palmpay');
            }
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const total = cart.reduce((add, item) => add + (item.price * item.quantity), 0);
    const logistics = getDeliveryCost(customer.state, customer.area);

    const initiatePaystack = (orderInfo: { email: string; total: number; tracking_code: string }) => {
        // @ts-ignore
        const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder', // User needs to set this
            email: orderInfo.email,
            amount: Math.round(orderInfo.total * 100), // In kobo
            currency: "NGN",
            ref: orderInfo.tracking_code,
            callback: (response: any) => {
                // On success: redirect to success page
                console.log("Paystack success:", response);
                window.location.href = `/order-success?ref=${response.reference}`;
            },
            onClose: () => {
                setIsLoading(false);
                alert('Payment cancelled. Your order is saved but pending payment.');
            }
        });
        handler.openIframe();
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await placeOrder({
                ...customer,
                shipping_fee: logistics,
                payment_method: paymentMethod,
            });

            // Save tracking code for order success page
            if (result?.tracking_code) {
                sessionStorage.setItem('wear_abbie_last_order_id', result.tracking_code);
            }

            if (paymentMethod === 'palmpay') {
                // For PalmPay: open WhatsApp with payment confirmation message, then redirect
                const grandTotal = total + logistics;
                const waMsg = encodeURIComponent(
                    `Hello Wear Abbie! I just placed an order and made payment.\n\n` +
                    `*Order ID:* ${result?.tracking_code || result?.order_id}\n` +
                    `*Amount Paid:* ₦${grandTotal.toLocaleString()}\n` +
                    `*Payment method:* PalmPay transfer to 8132484859\n\n` +
                    `Please find my payment screenshot attached.`
                );

                const waUrl = `https://wa.me/2348132484859?text=${waMsg}`;

                // Open WhatsApp
                window.open(waUrl, '_blank');

                // Redirect to success page after a delay to ensure WhatsApp starts
                setTimeout(() => {
                    setIsLoading(false);
                    window.location.href = '/order-success';
                }, 3000);
            } else if (paymentMethod === 'paystack') {
                initiatePaystack({
                    email: customer.email,
                    total: result.total || (total + logistics),
                    tracking_code: result.tracking_code || `WA-${Date.now()}`
                });
            } else {
                // Fallback (e.g. COD if ever enabled)
                setTimeout(() => {
                    setIsLoading(false);
                    window.location.href = '/order-success';
                }, 1200);
            }
        } catch (error: any) {
            console.error("Order error detailed:", error);
            setIsLoading(false);
            alert(`Order issue: ${error.message || 'Unknown error'}. Please contact support on WhatsApp: +234 813 248 4859`);
        }
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                :root { --font-outfit: 'Outfit', sans-serif; --font-playfair: 'Playfair Display', serif; }
                body { font-family: var(--font-outfit); }
            `}</style>

            {/* Simple Checkout Nav */}
            <nav className="border-b border-zinc-100 py-6 md:py-8 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <a href="/shop" className="flex items-center gap-3 text-zinc-400 hover:text-zinc-900 transition-colors group">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Resume Selection</span>
                    </a>
                    <img src="/logo.png" alt="Wear Abbie" className="h-8 md:h-10" />
                    <div className="flex items-center gap-3 text-emerald-500">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Secure Session</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Left: Forms */}
                    <div className="space-y-12">
                        <header className="mb-12">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="w-8 h-8 md:w-10 md:h-10 bg-[#3E2723] text-white rounded-full flex items-center justify-center font-black text-xs">0{step}</span>
                                <h1 className="text-3xl md:text-5xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    {step === 1 ? 'Dispatch Details' : 'Payment Method'}
                                </h1>
                            </div>
                            <p className="text-zinc-400 font-medium">Please provide your details for nationwide logistics delivery.</p>
                        </header>

                        <form onSubmit={handleComplete} className="space-y-8 animate-in">
                            {step === 1 ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">First Name</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                                                <input type="text" placeholder="Customer First Name" required value={customer.firstName} onChange={e => setCustomer({ ...customer, firstName: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-14 py-4 text-sm font-medium focus:bg-white focus:border-[#D4AF37] outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Last Name</label>
                                            <input type="text" placeholder="Customer Last Name" required value={customer.lastName} onChange={e => setCustomer({ ...customer, lastName: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-8 py-4 text-sm font-medium focus:bg-white focus:border-[#D4AF37] outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">State / Region</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                                                <select value={customer.state} onChange={(e) => setCustomer({ ...customer, state: e.target.value, area: '' })} className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-14 py-4 text-sm font-medium focus:bg-white focus:border-[#D4AF37] outline-none transition-all appearance-none">
                                                    {Object.keys(deliveryPricing).map(st => (
                                                        <option key={st} value={st}>{st}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">City / Area</label>
                                            <select value={customer.area} onChange={(e) => setCustomer({ ...customer, area: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-6 py-4 text-sm font-medium focus:bg-white focus:border-[#D4AF37] outline-none transition-all appearance-none">
                                                <option value="">Select Area (Optional)</option>
                                                {deliveryPricing[customer.state]?.areas && Object.keys(deliveryPricing[customer.state].areas as Record<string, number>).map(ar => (
                                                    <option key={ar} value={ar}>{ar}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Delivery Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                                            <input type="text" placeholder="123 Wear Abbie Boulevard, Lagos" required value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-14 py-4 text-sm font-medium focus:bg-white focus:border-[#D4AF37] outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                                                <input type="email" placeholder="customer@email.com" required value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-14 py-4 text-sm font-medium focus:bg-white focus:border-[#D4AF37] outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                                                <input type="tel" placeholder="+234..." required value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-full px-14 py-4 text-sm font-medium focus:bg-white focus:border-[#D4AF37] outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="button" onClick={() => { if (customer.firstName && customer.email && customer.address) setStep(2); else alert('Please fill your details first') }} className="w-full bg-[#3E2723] text-white py-6 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 group">
                                        Proceed to Payment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div
                                            onClick={() => setPaymentMethod('paystack')}
                                            className={`border-2 p-6 rounded-[30px] flex items-center justify-between group cursor-pointer transition-all hover:scale-[1.02] ${paymentMethod === 'paystack' ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-xl shadow-[#D4AF37]/10' : 'border-zinc-100 bg-white'}`}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100">
                                                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'paystack' ? 'text-[#D4AF37]' : 'text-zinc-300'}`} />
                                                </div>
                                                <div>
                                                    <h4 className={`font-black text-xs uppercase tracking-widest ${paymentMethod === 'paystack' ? 'text-[#D4AF37]' : 'text-zinc-400'}`}>Secure Card Payment</h4>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1 italic">Handled by Paystack Gateway</p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'paystack' ? 'border-[#D4AF37]' : 'border-zinc-200'}`}>
                                                {paymentMethod === 'paystack' && <div className="w-3 h-3 bg-[#D4AF37] rounded-full"></div>}
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setPaymentMethod('palmpay')}
                                            className={`border-2 p-6 rounded-[30px] flex flex-col items-start justify-between group cursor-pointer transition-all hover:scale-[1.02] ${paymentMethod === 'palmpay' ? 'border-[#6F3AF9] bg-[#6F3AF9]/5 shadow-xl shadow-[#6F3AF9]/10' : 'border-zinc-100 bg-white'}`}
                                        >
                                            <div className="flex items-center gap-6 w-full mb-4">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl p-3 overflow-hidden border-2 border-[#6F3AF9]/20 group-hover:scale-105 transition-transform">
                                                    <img src="/palmpay.webp" alt="PalmPay" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className={`font-black text-xs uppercase tracking-widest ${paymentMethod === 'palmpay' ? 'text-[#6F3AF9]' : 'text-zinc-400'}`}>Direct PalmPay Transfer</h4>
                                                        <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">VERIFIED</span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1 italic">Fast & Reliable for Guests</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'palmpay' ? 'border-[#6F3AF9]' : 'border-zinc-200'}`}>
                                                    {paymentMethod === 'palmpay' && <div className="w-3 h-3 bg-[#6F3AF9] rounded-full"></div>}
                                                </div>
                                            </div>

                                            {paymentMethod === 'palmpay' && (
                                                <div className="w-full bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-[#6F3AF9]/20 shadow-inner space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="font-black text-zinc-400 uppercase tracking-widest">Bank</span>
                                                        <span className="font-black text-[#6F3AF9]">PALMPAY</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-black text-zinc-400 uppercase tracking-widest text-[9px]">Account Number</span>
                                                        <span className="font-black text-2xl text-zinc-900 tracking-[0.2em]">8132484859</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[9px]">
                                                        <span className="font-black text-zinc-400 uppercase tracking-widest">Account Name</span>
                                                        <span className="font-black text-zinc-950 uppercase text-[10px]">Titilope Tijani</span>
                                                    </div>
                                                    <div className="pt-2 border-t border-zinc-100">
                                                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.1em] text-center">Transfer exact total & stay on this page for verification</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border border-zinc-100 p-6 rounded-[30px] flex items-center justify-between hover:border-zinc-200 transition-all cursor-pointer opacity-50 grayscale pointer-events-none mt-2">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center">
                                                    <Truck className="w-6 h-6 text-zinc-300" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-xs uppercase tracking-widest text-zinc-300">Cash on Delivery</h4>
                                                    <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest mt-1">Select regions only</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-zinc-50 rounded-[40px] border border-zinc-100 mt-4">
                                        <div className="flex items-center gap-4 text-zinc-400 mb-4 uppercase font-black text-[9px] tracking-widest">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            {isLoggedIn ? 'Secured by Paystack Infrastructure' : 'Manual Transfer Verification Required'}
                                        </div>
                                        <p className="text-zinc-500 text-xs font-medium leading-relaxed">By completing this order, you authorize Wear Abbie to process your data for logistics fulfillment. All transactions are encrypted.</p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setStep(1)} className="flex-[1] bg-white border border-zinc-100 py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-zinc-50 transition-all">Back</button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex-[2] py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all flex items-center justify-center gap-4 relative overflow-hidden"
                                            style={{
                                                background: paymentMethod === 'paystack' ? '#0BA4DB' : '#6F3AF9',
                                                color: 'white',
                                                boxShadow: paymentMethod === 'paystack' ? '0 20px 40px -10px rgba(11,164,219,0.3)' : '0 20px 40px -10px rgba(111,58,249,0.3)',
                                            }}
                                        >
                                            <span className={isLoading ? 'opacity-0' : 'flex items-center gap-3'}>
                                                {paymentMethod === 'paystack' ? (
                                                    <>Continue to Paystack <CreditCard className="w-4 h-4" /></>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.563 4.13 1.54 5.858L0 24l6.335-1.54A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 01-5.147-1.46l-.369-.219-3.76.914.945-3.668-.242-.381A9.797 9.797 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182c5.421 0 9.818 4.396 9.818 9.818S17.421 21.818 12 21.818z" /></svg>
                                                        Confirm Payment via WhatsApp
                                                    </>
                                                )}
                                            </span>
                                            {isLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                    {paymentMethod === 'palmpay' && (
                                        <p className="text-center text-[10px] text-zinc-400 font-medium leading-relaxed px-4">
                                            Clicking the button above will: <strong>1)</strong> Create your order with a unique tracking code <strong>2)</strong> Open WhatsApp so you can send your payment screenshot. Admin will confirm and dispatch your order.
                                        </p>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:sticky lg:top-32 h-fit space-y-8">
                        <div className="bg-zinc-50 rounded-[40px] p-8 md:p-12 border border-zinc-100">
                            <h3 className="text-2xl font-serif font-black mb-8" style={{ fontFamily: 'var(--font-playfair), serif' }}>Order Review</h3>

                            <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto no-scrollbar pr-4">
                                {!isInitialized ? (
                                    <div className="flex justify-center py-10">
                                        <div className="w-6 h-6 border-2 border-zinc-200 border-t-[#D4AF37] rounded-full animate-spin"></div>
                                    </div>
                                ) : cart.length === 0 ? (
                                    <p className="text-zinc-500 font-medium text-xs">Your cart is empty.</p>
                                ) : (
                                    cart.map((item, idx) => (
                                        <div key={idx} className="flex gap-6 items-center">
                                            <div className="w-20 h-20 bg-white rounded-2xl border border-zinc-100 p-2 flex items-center justify-center">
                                                <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-serif font-bold text-sm" style={{ fontFamily: 'var(--font-playfair), serif' }}>{item.name}</h4>
                                                <p className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest mb-2">{item.category}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-zinc-400">Qty: {item.quantity}</span>
                                                    <span className="font-black text-sm">₦{item.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="space-y-4 pt-8 border-t border-zinc-200">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Subtotal</span>
                                    <span className="text-zinc-900">₦{total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Logistics ({customer.area || customer.state})</span>
                                    <span className="text-zinc-900">₦{cart.length > 0 ? logistics.toLocaleString() : "0"}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black pt-6 border-t border-zinc-200">
                                    <span>Total Due</span>
                                    <span className="text-[#D4AF37]">₦{cart.length > 0 ? (total + logistics).toLocaleString() : "0"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 text-center bg-emerald-50/30 rounded-[30px] border border-emerald-100 flex items-center gap-4">
                            <Truck className="w-10 h-10 text-emerald-500" />
                            <div className="text-left">
                                <h4 className="font-black text-[10px] uppercase tracking-widest text-emerald-600 mb-1">Express Nationwide Logistics</h4>
                                <p className="text-[10px] font-medium text-emerald-700 leading-relaxed uppercase">Delivery within 24-48 hours across major hubs.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
