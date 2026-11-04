import { useCallback, useMemo } from 'react';
import { createStore } from '@store/createStore';
import { cartInitialState, cartReducer } from './cart.reducer';
import type { CartItem } from './cart.types';

const { StoreProvider, useStoreState, useStoreDispatch } = createStore({
  name: 'cart',
  version: 1,
  reducer: cartReducer,
  initialState: cartInitialState,
});

export { StoreProvider as CartProvider };

export function useCart() {
  const state = useStoreState();
  const dispatch = useStoreDispatch();

  const addItem = useCallback(
    (item: CartItem) => {
      dispatch({ type: 'cart/add', payload: item });
    },
    [dispatch],
  );

  const updateQuantity = useCallback(
    (idProductVariant: number, quantity: number) => {
      dispatch({ type: 'cart/updateQuantity', payload: { idProductVariant, quantity } });
    },
    [dispatch],
  );

  const removeItem = useCallback(
    (idProductVariant: number) => {
      dispatch({ type: 'cart/remove', payload: { idProductVariant } });
    },
    [dispatch],
  );

  const clear = useCallback(() => {
    dispatch({ type: 'cart/clear' });
  }, [dispatch]);

  const itemCount = useMemo(() => state.items.reduce((total, item) => total + item.quantity, 0), [state.items]);
  const subtotal = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0),
    [state.items],
  );

  return { items: state.items, itemCount, subtotal, addItem, updateQuantity, removeItem, clear };
}
