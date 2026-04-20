export interface Category { id: number; name: string; description: string; phone_count: number; created_at: string; }
export interface Phone { id: number; category: number; category_name: string; name: string; brand: string; model: string; price: number; description: string; stock: number; image_url: string; ram: string; storage: string; battery: string; camera: string; is_available: boolean; created_at: string; }
export interface CartItem { id: number; phone: number; phone_name: string; phone_brand: string; phone_price: number; phone_image: string; quantity: number; subtotal: number; added_at: string; }
export interface Cart { items: CartItem[]; total: string; count: number; }
export interface OrderItem { id: number; phone: number; phone_name: string; quantity: number; price_at_purchase: number; }
export interface Order { id: number; username: string; status: string; total_price: number; shipping_address: string; items: OrderItem[]; created_at: string; }
export interface User { id: number; username: string; email: string; first_name: string; last_name: string; date_joined: string; }
export interface AuthResponse { access: string; refresh: string; user?: any; message?: string; }
export interface LoginCredentials { username: string; password: string; }
export interface RegisterData { username: string; email: string; password: string; password2: string; }