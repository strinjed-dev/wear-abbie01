"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    inStock?: boolean;
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
    tracking_code?: string;
    payment_method?: string;
    payment_status?: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    order_id?: string;
    created_at: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Omit<Product, 'inStock' | 'isCOD'> & { image_url?: string }) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    orders: Order[];
    placeOrder: (customerInfo: any) => Promise<{ tracking_code?: string; order_id?: string }>;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    isInitialized: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    lastAddedItem: Product | null;
    clearLastAddedItem: () => void;
    notifications: Notification[];
    unreadCount: number;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [lastAddedItem, setLastAddedItem] = useState<Product | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const clearLastAddedItem = useCallback(() => setLastAddedItem(null), []);

    const fetchOrders = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const { data: dbOrders } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });
            if (dbOrders) {
                setOrders(dbOrders.map((o: any) => ({
                    id: o.id,
                    customer: { state: o.shipping_state, area: o.shipping_area, address: o.shipping_address },
                    items: o.items || [],
                    total: o.total_amount,
                    status: o.status,
                    date: o.created_at,
                    tracking_code: o.tracking_code,
                    payment_method: o.payment_method,
                    payment_status: o.payment_status,
                })));
            }
        } else {
            const savedOrders = localStorage.getItem("wear_abbie_orders");
            if (savedOrders) {
                try { setOrders(JSON.parse(savedOrders)); } catch (e) { }
            }
        }
    }, []);

    const fetchNotifications = useCallback(async (uid: string) => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
            .limit(30);
        if (data) setNotifications(data);
    }, []);

    const markNotificationRead = useCallback(async (id: string) => {
        setNotifications((prev: Notification[]) => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }, []);

    const markAllNotificationsRead = useCallback(async () => {
        setNotifications((prev: Notification[]) => prev.map(n => ({ ...n, is_read: true })));
        if (userId) {
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
        }
    }, [userId]);

    useEffect(() => {
        const initialize = async () => {
            try {
                const savedCart = localStorage.getItem("wear_abbie_cart");
                let initialCart: CartItem[] = [];
                if (savedCart) {
                    try { initialCart = JSON.parse(savedCart); setCart(initialCart); } catch (e) { }
                }

                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUserId(session.user.id);

                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('cart')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (profileError) {
                        // Table may not exist yet — silent fail, use local cart
                        console.warn("Profile table not ready:", profileError.message);
                    }

                    if (profile?.cart && Array.isArray(profile.cart) && profile.cart.length > 0) {
                        setCart(profile.cart as CartItem[]);
                    } else {
                        setCart(initialCart);
                    }

                    await fetchOrders();
                    await fetchNotifications(session.user.id);
                } else {
                    setCart(initialCart);
                }

                // Auth state change listener
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
                    if (event === 'SIGNED_OUT') {
                        setCart([]);
                        setOrders([]);
                        setNotifications([]);
                        setUserId(null);
                        localStorage.removeItem("wear_abbie_cart");
                    } else if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
                        setUserId(session.user.id);
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('cart')
                            .eq('id', session.user.id)
                            .maybeSingle();
                        if (profile?.cart) setCart(profile.cart as CartItem[]);
                        fetchOrders();
                        fetchNotifications(session.user.id);
                    }
                });

                return () => subscription.unsubscribe();
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
    }, [fetchOrders, fetchNotifications]);

    // Realtime notifications subscription
    useEffect(() => {
        if (!userId) return;
        const channel = supabase
            .channel(`notifications-${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            }, (payload: any) => {
                setNotifications((prev: Notification[]) => [payload.new as Notification, ...prev]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    // Sync cart to server + localStorage
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

    const addToCart = (product: Omit<Product, 'inStock' | 'isCOD'> & { image_url?: string }) => {
        // Normalize: support both 'image' and 'image_url' fields from DB
        const normalised: CartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            image: (product as any).image || product.image_url || '',
            description: product.description,
            quantity: 1,
        };
        setCart((prev: CartItem[]) => {
            const existing = prev.find((item: CartItem) => item.id === product.id);
            if (existing) {
                return prev.map((item: CartItem) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, normalised];
        });
        setLastAddedItem(normalised);
        setTimeout(() => setLastAddedItem(null), 3000);
    };

    const removeFromCart = (productId: string) => {
        setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prev: CartItem[]) => prev.map((item: CartItem) => item.id === productId ? { ...item, quantity } : item));
    };

    const clearCart = () => setCart([]);

    const placeOrder = async (customerInfo: any): Promise<{ tracking_code?: string; order_id?: string }> => {
        const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
        const { data: { session } } = await supabase.auth.getSession();

        const { data: insertedOrder, error: insertError } = await supabase
            .from('orders')
            .insert({
                user_id: session?.user?.id || null,
                total_amount: total,
                shipping_fee: customerInfo.shipping_fee || 0,
                shipping_address: customerInfo.address,
                shipping_state: customerInfo.state,
                shipping_area: customerInfo.area,
                contact_email: customerInfo.email,
                contact_phone: customerInfo.phone,
                payment_method: customerInfo.payment_method || 'palmpay',
                payment_status: 'pending',
                status: 'pending',
                items: cart,
            })
            .select('id, tracking_code')
            .single();

        if (insertError) {
            console.error("Order insert error:", insertError);
            throw insertError;
        }

        const orderId = insertedOrder?.id;
        const trackingCode = insertedOrder?.tracking_code;

        if (session?.user) {
            await fetchOrders();
        } else {
            // Guest: save tracking code to localStorage for tracking page
            const guestOrders = JSON.parse(localStorage.getItem("wear_abbie_guest_orders") || "[]");
            guestOrders.unshift({ tracking_code: trackingCode, order_id: orderId, date: new Date().toISOString(), total, items: cart });
            localStorage.setItem("wear_abbie_guest_orders", JSON.stringify(guestOrders));
        }

        clearCart();
        return { tracking_code: trackingCode, order_id: orderId };
    };

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, clearCart,
            orders, placeOrder,
            isCartOpen, setIsCartOpen,
            isInitialized,
            searchQuery, setSearchQuery,
            lastAddedItem, clearLastAddedItem,
            notifications, unreadCount, markNotificationRead, markAllNotificationsRead,
        }}>
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
