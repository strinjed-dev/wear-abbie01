import { ShieldCheck, Truck, CreditCard } from 'lucide-react';

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
                        <a href="https://www.tiktok.com/@wear.abbie?_r=1&_t=ZS-94I4fSegq5S" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37] transition-all transform hover:scale-110">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.23-.15-.44-.31-.64-.49v8.29c.04 1.48-.41 3.01-1.39 4.11-1.15 1.4-3.03 2.1-4.78 1.95-1.76-.01-3.52-.92-4.48-2.39-1.02-1.42-1.22-3.32-.57-4.89.65-1.74 2.27-3.04 4.1-3.23l.11 4.13c-1.3-.02-2.73.74-3.19 1.96-.28.81-.13 1.73.34 2.45.42.72 1.25 1.15 2.08 1.15.71-.01 1.4-.35 1.83-.91.43-.6.54-1.39.51-2.12V.02z" /></svg>
                        </a>
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
