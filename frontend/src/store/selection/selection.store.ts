import { useSyncExternalStore } from 'react';

/**
 * Selección de entidades navegadas (producto, pedido, etc.).
 * Vive solo en memoria: los ids no aparecen en la URL y se pierden al recargar,
 * en cuyo caso las rutas redirigen a su pagina padre.
 */
export interface SelectionState {
  idProduct: number | null;
  idInvoice: number | null;
  idAdminProduct: number | null;
  idCheckoutInvoice: number | null;
  image: { idVariant: number; index: number } | null;
}

const initialState: SelectionState = {
  idProduct: null,
  idInvoice: null,
  idAdminProduct: null,
  idCheckoutInvoice: null,
  image: null,
};

let state: SelectionState = initialState;
const listeners = new Set<() => void>();

export function getSelection(): SelectionState {
  return state;
}

export function setSelection(patch: Partial<SelectionState>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export function clearSelection(): void {
  state = initialState;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSelection(): SelectionState {
  return useSyncExternalStore(subscribe, getSelection, getSelection);
}
