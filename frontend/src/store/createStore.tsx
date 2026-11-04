import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode, type Reducer } from 'react';
import { storage } from '@core';

interface CreateStoreOptions<S, A> {
  name: string;
  version: number;
  reducer: Reducer<S, A>;
  initialState: S;
  partialize?: (state: S) => Partial<S>;
}

export function createStore<S, A>({
  name,
  version,
  reducer,
  initialState,
  partialize = (s) => s,
}: CreateStoreOptions<S, A>) {
  const StateContext = createContext<S | null>(null);
  const DispatchContext = createContext<Dispatch<A> | null>(null);

  const hydrate = (initial: S): S => {
    const saved = storage.read<Partial<S>>(name, version);
    return saved ? { ...initial, ...saved } : initial;
  };

  function StoreProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState, hydrate);
    useEffect(() => {
      storage.write(name, version, partialize(state));
    }, [state]);
    return (
      <DispatchContext value={dispatch}>
        <StateContext value={state}>{children}</StateContext>
      </DispatchContext>
    );
  }
  function useStoreState(): S {
    const ctx = useContext(StateContext);
    if (ctx === null) throw new Error(`[${name}] used outside its provider`);
    return ctx;
  }
  function useStoreDispatch(): Dispatch<A> {
    const ctx = useContext(DispatchContext);
    if (ctx === null) throw new Error(`[${name}] used outside its provider`);
    return ctx;
  }
  return { StoreProvider, useStoreState, useStoreDispatch };
}
