import React, { useRef } from 'react';
import type { PropsWithChildren } from 'react';

import { useStore } from 'zustand';
import type { StoreApi } from 'zustand';

import { createContext } from 'src/core/contexts/context';
import type { CreateContextProps } from 'src/core/contexts/context';

type ExtractFromStoreApi<T> = T extends StoreApi<infer U> ? Exclude<U, void> : never;

export function createZustandContext<Store extends StoreApi<Type>, Type = ExtractFromStoreApi<Store>, Props = any>(
  props: CreateContextProps<Store> & {
    initialCreateStore: (props: Props) => Store;
  },
) {
  const { initialCreateStore, ...rest } = props;
  const { Provider, useCtx, useHasProvider } = createContext<Store>(rest);

  function useSelector<U>(selector: (state: Type) => U) {
    return useStore(useCtx(), selector);
  }

  function MyProvider({ children, ...props }: PropsWithChildren<Props>) {
    const storeRef = useRef<Store>();
    if (!storeRef.current) {
      storeRef.current = initialCreateStore(props as Props);
    }
    return <Provider value={storeRef.current}>{children}</Provider>;
  }

  return {
    Provider: MyProvider,
    useSelector,
    useHasProvider,
  };
}
