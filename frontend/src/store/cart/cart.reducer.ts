import type { CartAction, CartState } from './cart.types';

export const cartInitialState: CartState = { items: [] };

function clampQuantity(quantity: number, availableStock: number): number {
  return Math.max(0, Math.min(quantity, availableStock));
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'cart/add': {
      const existing = state.items.find((item) => item.idProductVariant === action.payload.idProductVariant);
      if (!existing) {
        const quantity = clampQuantity(action.payload.quantity, action.payload.availableStock);
        return quantity > 0 ? { items: [...state.items, { ...action.payload, quantity }] } : state;
      }
      return {
        items: state.items.map((item) =>
          item.idProductVariant === action.payload.idProductVariant
            ? { ...item, quantity: clampQuantity(item.quantity + action.payload.quantity, item.availableStock) }
            : item,
        ),
      };
    }
    case 'cart/updateQuantity':
      return {
        items: state.items
          .map((item) =>
            item.idProductVariant === action.payload.idProductVariant
              ? { ...item, quantity: clampQuantity(action.payload.quantity, item.availableStock) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case 'cart/remove':
      return { items: state.items.filter((item) => item.idProductVariant !== action.payload.idProductVariant) };
    case 'cart/clear':
      return cartInitialState;
    default:
      return state;
  }
}
