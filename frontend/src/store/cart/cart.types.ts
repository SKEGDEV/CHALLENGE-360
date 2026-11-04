export interface CartItem {
  idProductVariant: number;
  sku: string;
  productName: string;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  availableStock: number;
  photoKey: string | null;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'cart/add'; payload: Omit<CartItem, 'quantity'> & { quantity: number } }
  | { type: 'cart/updateQuantity'; payload: { idProductVariant: number; quantity: number } }
  | { type: 'cart/remove'; payload: { idProductVariant: number } }
  | { type: 'cart/clear' };
