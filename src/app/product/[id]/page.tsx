"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ChevronLeft, Heart, Share2, Truck, ShieldCheck, CreditCard, Star, Plus, Minus, ArrowRight, X, Bell } from 'lucide-react';
import productsData from '@/data/products.json';
import { supabase } from '@/lib/supabase';
import { useCart, Product } from '@/context/CartContext';
import MemberNavbar from '@/components/layout/MemberNavbar';
import Footer from '@/components/layout/Footer';


export default function ProductDetailPage() {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [userLocation, setUserLocation] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [addedFeedback, setAddedFeedback] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const { addToCart, cart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            // First check local data for instant load
            const localProduct = productsData.find(p => p.id === id);
            if (localProduct) {
                setProduct({
                    ...localProduct,
                    image: localProduct.image || '/logo.png',
                    inStock: localProduct.stock !== undefined ? localProduct.stock > 0 : (localProduct.inStock ?? true)
                } as Product);
                setIsLoading(false);
            }

            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle();

                if (data) {
                    setProduct({
                        ...data,
                        image: data.image_url || data.image || '/logo.png',
                        inStock: data.stock !== undefined ? data.stock > 0 : true,
                    } as Product);
                } else if (!localProduct) {
                    setProduct(null);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchUserLocation = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase.from('profiles').select('location').eq('id', session.user.id).single();
                if (profile?.location) {
                    setUserLocation(profile.location);
                }
            }
        };

        const checkWishlist = () => {
            const list = localStorage.getItem('wear_abbie_wishlist');
            if (list) {
                try {
                    const parsed = JSON.parse(list);
                    if (parsed.some((w: any) => w.id === id)) {
                         setIsWishlisted(true);
                    }
                } catch(e) {}
            }
        };

        fetchProduct();
        fetchUserLocation();
        checkWishlist();

        // Real-time listener
        const channel = supabase.channel(`product-${id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products', filter: `id=eq.${id}` }, (payload: any) => {
                setProduct((prev: Product | null) => prev ? {
                    ...prev,
                    price: payload.new.price,
                    stock: payload.new.stock,
                    inStock: (payload.new.stock ?? 0) > 0,
                    name: payload.new.name,
                    description: payload.new.description
                } : null);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;

        for (let i = 0; i < quantity; i++) {
            addToCart({
                ...product,
                quantity: 1
            });
        }

        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 2000);
    };

    const toggleWishlist = () => {
        if (!product) return;
        const listStr = localStorage.getItem('wear_abbie_wishlist');
        let list = [];
        if (listStr) {
            try { list = JSON.parse(listStr); } catch(e) {}
        }
        
        if (isWishlisted) {
            list = list.filter((w: any) => w.id !== product.id);
            setIsWishlisted(false);
        } else {
            list.push(product);
            setIsWishlisted(true);
        }
        localStorage.setItem('wear_abbie_wishlist', JSON.stringify(list));
        // Force an event to notify if other tabs/components are listening
        window.dispatchEvent(new Event('storage'));
    };

    const handleWaitlistRequest = async () => {
        if (!product) return;

        setIsRequesting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please sign in to join the waitlist.");
                window.location.href = '/auth';
                return;
            }

            const { error } = await supabase.from('item_requests').insert({
                user_id: user.id,
                product_id: product.id,
                status: 'pending'
            });

            if (error) throw error;

            setRequestSuccess(true);
            setTimeout(() => setRequestSuccess(false), 3000);
        } catch (err: any) {
            console.error("Waitlist error:", err);
            alert("Failed to join waitlist. Please try again.");
        } finally {
            setIsRequesting(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 space-y-12">
            <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 animate-pulse">
                <div className="aspect-[4/5] bg-zinc-50 rounded-[60px] p-16 flex items-center justify-center border border-zinc-100 mt-24">
                   <div className="w-48 h-48 bg-zinc-200 rounded-full"></div>
                </div>
                <div className="space-y-12 mt-24">
                   <div className="space-y-4">
                      <div className="h-4 w-24 bg-zinc-100 rounded-full"></div>
                      <div className="h-16 w-3/4 bg-zinc-200 rounded-3xl"></div>
                   </div>
                   <div className="space-y-4">
                      <div className="h-8 w-32 bg-zinc-200 rounded-full"></div>
                      <div className="h-24 w-full bg-zinc-100 rounded-3xl"></div>
                   </div>
                   <div className="h-16 w-full bg-zinc-900 rounded-full opacity-10"></div>
                </div>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-12 text-center space-y-8 animate-in mt-10">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
                <X size={40} />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-serif font-black" style={{ fontFamily: 'var(--font-playfair), serif' }}>Scent Not Found</h1>
                <p className="text-zinc-500 font-medium max-w-sm">We couldn't find the fragrance you're looking for. It might have been retired or moved.</p>
            </div>
            <Link href="/shop" className="bg-zinc-900 text-white px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-xl">
                Return to Boutique
            </Link>
        </div>
    );

    const cartCount = cart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);

    return (
        <div className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap');
                :root { --font-outfit: 'Outfit', sans-serif; --font-playfair: 'Playfair Display', serif; }
                body { font-family: var(--font-outfit); }
                .font-serif { font-family: var(--font-playfair); }
                .animate-in { animation: fade-in 0.6s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <MemberNavbar />

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-32">
                {/* Breadcrumb */}
                <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors group mb-12 cursor-pointer bg-transparent border-none">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Boutique</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    {/* Left: Interactive Image */}
                    <div className="space-y-8 sticky top-32">
                        <div className="aspect-[4/5] bg-zinc-50 rounded-[40px] md:rounded-[60px] p-8 md:p-16 flex items-center justify-center relative overflow-hidden group shadow-sm border border-zinc-100">
                            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute top-8 right-8 flex flex-col gap-4">
                                <button onClick={toggleWishlist} className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transition-colors ${isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-zinc-400 hover:text-red-500'}`}>
                                    <Heart className="w-5 h-5 transition-all" fill={isWishlisted ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({ title: product.name, url: window.location.href });
                                        } else {
                                            navigator.clipboard.writeText(window.location.href);
                                        }
                                    }}
                                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:text-[#D4AF37] transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-12 animate-in">
                        <header>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{product.category}</span>
                                <div className="flex items-center gap-1 text-zinc-900">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                    <span className="text-[10px] font-bold text-zinc-400 ml-2 uppercase tracking-widest">Authentic Product</span>
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-serif font-black mb-6 tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>{product.name}</h1>
                            <div className="flex items-center gap-6">
                                <p className="text-3xl md:text-5xl font-black">₦{product.price.toLocaleString()}</p>
                                {(() => {
                                    const match = product.description?.match(/\|\|ORIG_PRICE:(\d+)\|\|/);
                                    if (match) {
                                        const originalPrice = parseInt(match[1]);
                                        const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);
                                        return (
                                            <div className="flex items-center gap-3">
                                                <p className="text-lg md:text-2xl text-zinc-400 line-through font-bold">₦{originalPrice.toLocaleString()}</p>
                                                <span className="bg-zinc-900 text-[#D4AF37] px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest animate-pulse">Save {discountPercent}%</span>
                                            </div>
                                        );
                                    }
                                    return <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest">Tax Included</p>;
                                })()}
                            </div>
                        </header>

                        <div className="p-8 bg-zinc-50 rounded-[40px] border border-zinc-100">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Olfactory Narrative</h3>
                            <p className="text-zinc-500 font-medium leading-relaxed text-lg italic">
                                "{(() => {
                                    const raw = product.description || "A masterfully curated scent designed to leave a lasting impression. Experience the craftsmanship of Wear Abbie's collection.";
                                    return raw.replace(/\n?\|\|ORIG_PRICE:\d+\|\|/g, '').trim();
                                })()}"
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Quantity + Add to Cart */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center bg-zinc-50 rounded-full border border-zinc-100 p-2">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-full transition-all">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-full transition-all">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    disabled={isRequesting}
                                    onClick={!product.inStock ? handleWaitlistRequest : handleAddToCart}
                                    className={`flex-grow py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all flex items-center justify-center gap-4 group
                                        ${!product.inStock
                                            ? requestSuccess ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-[#D4AF37] hover:bg-black'
                                            : addedFeedback
                                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                                : 'bg-[#D4AF37] text-white shadow-[#D4AF37]/20 hover:bg-[#3E2723]'
                                        }`}
                                >
                                    {!product.inStock ? (
                                        requestSuccess ? "Added to Waitlist ✓" : isRequesting ? "Requesting..." : <>Notify Me When Restocked <Bell className="w-4 h-4" /></>
                                    ) : addedFeedback ? (
                                        <>Added to Bag ✓</>
                                    ) : (
                                        <>Add to Boutique Bag <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" /></>
                                    )}
                                </button>
                            </div>

                            {product.inStock && (
                                <Link
                                    href="/checkout"
                                    className="w-full bg-[#3E2723] text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all flex items-center justify-center gap-4 shadow-xl"
                                >
                                    Fast Purchase <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>

                        {/* Value Props */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-zinc-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><Truck className="w-5 h-5" /></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nationwide <br /> Dispatch</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><ShieldCheck className="w-5 h-5" /></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Authentic <br /> Product</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-50 rounded-2xl text-[#D4AF37]"><CreditCard className="w-5 h-5" /></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Secure <br /> Checkout</p>
                            </div>
                        </div>

                        {/* Location Display */}
                        {userLocation && (
                            <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between group cursor-help transition-all hover:bg-emerald-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <Truck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mb-0.5">Delivery Set To</p>
                                        <p className="text-xs font-bold text-emerald-900">{userLocation}</p>
                                    </div>
                                </div>
                                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Confirmed
                                </div>
                            </div>
                        )}

                        {/* WhatsApp Order Option */}
                        {product.inStock && (
                            <a
                                href={`https://wa.me/2348132484859?text=Hello%20Wear%20Abbie%2C%20I%20want%20to%20order%3A%20${encodeURIComponent(product.name)}%20(₦${product.price.toLocaleString()})`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full border-2 border-emerald-200 text-emerald-700 bg-emerald-50 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all flex items-center justify-center gap-4"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.563 4.13 1.54 5.858L0 24l6.335-1.54A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 01-5.147-1.46l-.369-.219-3.76.914.945-3.668-.242-.381A9.797 9.797 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182c5.421 0 9.818 4.396 9.818 9.818S17.421 21.818 12 21.818z" /></svg>
                                Order via WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
