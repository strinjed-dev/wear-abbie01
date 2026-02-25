import { Instagram, Facebook, Twitter, ShieldCheck, Truck, CreditCard } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#F8F8F8] pt-16 pb-8 border-t border-gray-200">
            <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div>
                    <img src="/logo.png" alt="Logo" className="h-10 mb-6" />
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        Smelling nice is our priority. We selective the world's finest scents to elevate your daily presence.
                    </p>
                    <div className="flex gap-4">
                        <Instagram className="w-5 h-5 text-gray-400 hover:text-[#D4AF37] cursor-pointer transition-colors" />
                        <Facebook className="w-5 h-5 text-gray-400 hover:text-[#D4AF37] cursor-pointer transition-colors" />
                        <Twitter className="w-5 h-5 text-gray-400 hover:text-[#D4AF37] cursor-pointer transition-colors" />
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Collections</h4>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li><a href="/shop" className="hover:text-black transition-colors">Signature Series</a></li>
                        <li><a href="/shop" className="hover:text-black transition-colors">Smart Collection</a></li>
                        <li><a href="/shop" className="hover:text-black transition-colors">Exclusive Boutique</a></li>
                        <li><a href="/shop" className="hover:text-black transition-colors">Gift Essentials</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Account & Help</h4>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li className="hover:text-black cursor-pointer">Review My Orders</li>
                        <li className="hover:text-black cursor-pointer">Shipping & Logistics</li>
                        <li className="hover:text-black cursor-pointer">Frequently Asked</li>
                        <li className="hover:text-black cursor-pointer">Contact Our Team</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-6">The Elite Promise</h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                            <span className="text-sm text-gray-500">Authentic Guaranteed</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 text-[#D4AF37]" />
                            <span className="text-sm text-gray-500">Elite Delivery Network</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                            <span className="text-sm text-gray-500">Secure Global Payments</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container border-t border-gray-200 pt-8 text-center text-xs text-gray-400">
                © 2026 Wear Abbie Signature. All rights reserved. Registered Trademark.
            </div>
        </footer>
    );
}
