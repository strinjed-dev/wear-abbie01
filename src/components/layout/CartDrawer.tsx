"use client";

import { X, Trash2, ShieldCheck, LockIcon } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
}

export default function CartDrawer({ isOpen, onClose, cart }: { isOpen: boolean, onClose: () => void, cart: Product[] }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-zinc-900/60 backdrop-blur-md flex justify-end transition-all duration-500">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-0 overflow-hidden animate-slide-in">

                {/* Header */}
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-3xl font-serif font-black tracking-tight text-zinc-900 leading-none mb-1">Your Bag</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">{cart.length} Elite Selection(s)</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-full bg-white border border-zinc-100 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-sm"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Product Items */}
                <div className="flex-grow overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {cart.map((item, i) => (
                        <div key={i} className="flex gap-6 items-center group">
                            <div className="w-24 h-24 bg-zinc-50 rounded-[20px] flex items-center justify-center p-4 border border-zinc-100 transition-all duration-500 group-hover:bg-white group-hover:shadow-lg group-hover:border-gold/20">
                                <img src={item.image} alt="" className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-serif font-black text-lg text-zinc-800 leading-tight truncate w-40">{item.name}</h4>
                                    <button className="text-zinc-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="text-gold font-black text-lg">₦{item.price.toLocaleString()}</p>
                                <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-3 bg-zinc-50 rounded-full px-3 py-1 border border-zinc-100">
                                        <button className="text-zinc-400 font-bold">-</button>
                                        <span className="text-xs font-black w-4 text-center">1</span>
                                        <button className="text-zinc-400 font-bold">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-20">
                            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag className="w-8 h-8 text-zinc-300" />
                            </div>
                            <p className="text-zinc-400 font-serif italic text-2xl mb-4">The Bag is Empty.</p>
                            <button
                                onClick={onClose}
                                className="text-gold font-black uppercase tracking-[0.2em] text-[10px] underline underline-offset-8"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    )}
                </div>

                {/* Checkout Footer */}
                <div className="p-8 bg-zinc-50/80 border-t border-zinc-100">
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-zinc-400 uppercase font-black text-[10px] tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-zinc-900 text-sm italic">₦{cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-400 uppercase font-black text-[10px] tracking-widest">
                            <span>Fast Shipping</span>
                            <span className="text-zinc-400 text-xs lowercase">calculated next step</span>
                        </div>
                        <div className="h-[1px] w-full bg-zinc-200/50"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-serif font-black text-2xl text-zinc-900">Total</span>
                            <span className="font-black text-2xl text-zinc-900 tracking-tight">₦{cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <button className="btn-elite btn-elite-primary w-full shadow-2xl shadow-brown-rich/30 relative flex items-center justify-center gap-3 py-5 alive-glow">
                        <LockIcon size={18} className="text-gold" />
                        Proceed to Secure Checkout
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-3 opacity-40">
                        <ShieldCheck size={14} />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Ssl Protocol Enabled</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShoppingBag({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    );
}
