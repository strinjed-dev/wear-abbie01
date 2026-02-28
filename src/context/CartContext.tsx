"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    inStock: boolean;
    isCOD?: boolean;
    description?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    customer: any;
    items: CartItem[];
    total: number;
    status: string;
    date: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    orders: Order[];
    placeOrder: (customerInfo: any) => Promise<void>;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    isInitialized: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    lastAddedItem: Product | null;
    clearLastAddedItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [lastAddedItem, setLastAddedItem] = useState<Product | null>(null);

    const clearLastAddedItem = useCallback(() => setLastAddedItem(null), []);

    const fetchOrders = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data: dbOrders } = await supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
            if (dbOrders) {
                setOrders(dbOrders.map((o: any) => ({
                    id: o.id,
                    customer: { state: o.shipping_state, area: o.shipping_area, address: o.shipping_address },
                    items: o.items || [],
                    total: o.total_amount,
                    status: o.status,
                    date: o.created_at
                })));
            }
        } else {
            const savedOrders = localStorage.getItem("wear_abbie_orders");
            if (savedOrders) {
                try { setOrders(JSON.parse(savedOrders)); } catch (e) { }
            }
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            try {
                // Load Local Cart FIRST
                const savedCart = localStorage.getItem("wear_abbie_cart");
                let initialCart: CartItem[] = [];
                if (savedCart) {
                    try {
                        initialCart = JSON.parse(savedCart);
                        setCart(initialCart);
                        console.log("Loaded cart from localStorage:", initialCart);
                    } catch (e) {
                        console.error("Cart parse error:", e);
                    }
                }

                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("Session error during init:", sessionError);
                }

                if (session?.user) {
                    // Sync Cart with Server
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('cart')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (profileError) {
                        console.error("Profile fetch error detected:", profileError);
                    }

                    if (profile?.cart) {
                        setCart(profile.cart as CartItem[]);
                    } else {
                        // If no server cart, use local cart but then it will be synced to server
                        setCart(initialCart);
                    }

                    // Fetch Orders
                    await fetchOrders();
                } else {
                    // Not logged in: Use local cart
                    setCart(initialCart);
                }

                // Auth Listener for Logout/Login
                const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                    if (event === 'SIGNED_OUT') {
                        setCart([]);
                        setOrders([]);
                        localStorage.removeItem("wear_abbie_cart");
                        localStorage.removeItem("wear_abbie_orders");
                    } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                        if (session?.user) {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('cart')
                                .eq('id', session.user.id)
                                .maybeSingle();
                            if (profile?.cart) setCart(profile.cart as CartItem[]);
                            fetchOrders();
                        }
                    }
                });

                return () => {
                    authSubscription.unsubscribe();
                };
            } catch (error) {
                console.error("CartContext initialization failed:", error);
            } finally {
                setIsInitialized(true);
            }
            return () => { };
        };

        const cleanupPromise = initialize();

        const handleManualOrderUpdate = () => fetchOrders();
        window.addEventListener("wear_abbie_orders_updated", handleManualOrderUpdate);

        return () => {
            window.removeEventListener("wear_abbie_orders_updated", handleManualOrderUpdate);
            cleanupPromise.then(cleanup => cleanup && cleanup());
        };
    }, [fetchOrders]);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("wear_abbie_cart", JSON.stringify(cart));

            const syncCart = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    await supabase.from('profiles').update({ cart }).eq('id', session.user.id);
                }
            };
            syncCart();
        }
    }, [cart, isInitialized]);

    const addToCart = (product: Product) => {
        setCart((prev: CartItem[]) => {
            const existing = prev.find((item: CartItem) => item.id === product.id);
            if (existing) {
                return prev.map((item: CartItem) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        // Show toast notification
        setLastAddedItem(product);
        setTimeout(() => setLastAddedItem(null), 3000);
    };

    const removeFromCart = (productId: string) => {
        setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        setCart((prev: CartItem[]) => prev.map((item: CartItem) => item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
    };

    const clearCart = () => {
        setCart([]);
    };

    const placeOrder = async (customerInfo: any) => {
        const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
        const { data: { session } } = await supabase.auth.getSession();

        // Always save to Supabase so Admin can see it
        const { error: insertError } = await supabase.from('orders').insert({
            user_id: session?.user?.id || null, // null for guests
            total_amount: total,
            shipping_fee: customerInfo.shipping_fee || 0,
            shipping_address: customerInfo.address,
            shipping_state: customerInfo.state,
            shipping_area: customerInfo.area,
            contact_email: customerInfo.email,
            contact_phone: customerInfo.phone,
            payment_method: session?.user ? 'Paystack/Transfer' : 'PalmPay Transfer',
            status: 'pending',
            items: cart
        });

        if (insertError) {
            console.error("Supabase Order Insert Error:", insertError);
            // Fallback for guest if RLS fails, but ideally RLS allows this
            if (!session?.user) {
                const newOrder: Order = {
                    id: `GUEST-${Date.now()}`,
                    customer: customerInfo,
                    items: cart,
                    total,
                    status: 'pending',
                    date: new Date().toISOString()
                };
                const existingOrders = JSON.parse(localStorage.getItem("wear_abbie_orders") || "[]");
                const updatedOrders = [newOrder, ...existingOrders];
                localStorage.setItem("wear_abbie_orders", JSON.stringify(updatedOrders));
                setOrders(updatedOrders);
            }
            throw insertError;
        }

        if (session?.user) {
            await fetchOrders();
        } else {
            // Also store in localStorage for guest tracking on their side
            const newOrder: Order = {
                id: `GUEST-${Date.now()}`,
                customer: customerInfo,
                items: cart,
                total,
                status: 'pending',
                date: new Date().toISOString()
            };
            const existingOrders = JSON.parse(localStorage.getItem("wear_abbie_orders") || "[]");
            const updatedOrders = [newOrder, ...existingOrders];
            localStorage.setItem("wear_abbie_orders", JSON.stringify(updatedOrders));
            setOrders(updatedOrders);
        }

        clearCart();
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, orders, placeOrder, isCartOpen, setIsCartOpen, isInitialized, searchQuery, setSearchQuery }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
