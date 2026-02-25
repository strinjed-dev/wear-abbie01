export interface Product {
    id: string;
    name: string;
    brand?: string;
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
