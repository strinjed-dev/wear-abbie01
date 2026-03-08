export interface Product {
    id: string;
    name: string;
    brand?: string;
    price: number;
    original_price?: number; // Original price before discount
    category: string;
    image: string;
    image_url?: string; // Standard SQL field
    inStock?: boolean;
    stock?: number;     // Numeric stock level
    isCOD?: boolean;
    is_active?: boolean;
    is_cod?: boolean;
    description?: string;
    size?: string;
    type?: string;
    created_at?: string;
}

export interface Order {
    id: string;
    user_id?: string;
    status: string;
    total: number;
    total_amount?: number; // Standard SQL field
    items: any[];
    customer?: {
        state: string;
        area: string;
        address: string;
    };
    shipping_area?: string;
    shipping_state?: string;
    shipping_address?: string;
    customer_name?: string;
    shipping_fee?: number;
    profiles?: {
        full_name: string;
        email: string;
        phone?: string;
        address?: string;
        location?: string;
    };
    tracking_code?: string;
    contact_email?: string;
    contact_phone?: string;
    phone?: string;
    payment_method?: string;
    payment_status?: string;
    rider_id?: string;
    dispatch_name?: string;
    dispatch_phone?: string;
    current_location?: string;
    stock_deducted?: boolean;
    date?: string;
    created_at?: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    image_url?: string;
}

export interface Notification {
    id: string;
    user_id?: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    order_id?: string;
    created_at: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Profile {
    id: string;
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    role?: 'user' | 'admin' | 'rider';
    is_premium?: boolean;
    created_at: string;
    cart?: any[];
}
