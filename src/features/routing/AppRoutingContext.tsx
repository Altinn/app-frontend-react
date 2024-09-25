import React, { useEffect, useMemo, useState } from 'react';
import { matchPath, useNavigate as useNativeNavigate } from 'react-router-dom';
import type { MutableRefObject, PropsWithChildren } from 'react';

import { createStore } from 'zustand';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { router } from 'src/index';

export type NavigationEffectCb = () => void;

interface ContextParams {
  partyId?: string;
  instanceGuid?: string;
  taskId?: string;
  pageKey?: string;
  componentId?: string;
  dataElementId?: string;
  mainPageKey?: string;
  isSubformPage?: boolean;
}
interface Context {
  params: ContextParams;
  paramsRef: MutableRefObject<ContextParams>;
  queryKeys: {
    [key: string]: string | undefined;
  };
  queryKeysRef: MutableRefObject<{
    [key: string]: string | undefined;
  }>;
  updateParams: (params: Context['params']) => void;
  updateQueryKeys: (queryKeys: Context['queryKeys']) => void;
  effectCallback: NavigationEffectCb | null;
  setEffectCallback: (cb: NavigationEffectCb | null) => void;
  navigateRef: MutableRefObject<ReturnType<typeof useNativeNavigate>>;
}

function newStore() {
  return createStore<Context>((set) => ({
    params: {},
    paramsRef: { current: {} },
    queryKeys: {},
    queryKeysRef: { current: {} },
    updateParams: (params) => set({ params }),
    updateQueryKeys: (queryKeys) => set({ queryKeys }),
    effectCallback: null,
    setEffectCallback: (effectCallback: NavigationEffectCb) => set({ effectCallback }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigateRef: { current: undefined as any },
  }));
}

const { Provider, useSelector } = createZustandContext<ReturnType<typeof newStore>>({
  name: 'AppRouting',
  required: true,
  initialCreateStore: newStore,
});

export function AppRoutingProvider({ children }: PropsWithChildren) {
  return (
    <Provider>
      <UpdateParams />
      <UpdateQueryKeys />
      <UpdateNavigate />
      {children}
    </Provider>
  );
}

export const useAllNavigationParamsAsRef = () => useSelector((ctx) => ctx.paramsRef);
export const useNavigationParam = <T extends keyof ContextParams>(key: T) => {
  // Will trigger a re-render when it changes but also makes sure to use the latest value in case some other render gets triggered first
  useSelector((ctx) => ctx.params[key]);
  return useSelector((ctx) => ctx.paramsRef.current[key]);
};
export const useNavigationEffect = () => useSelector((ctx) => ctx.effectCallback);
export const useSetNavigationEffect = () => useSelector((ctx) => ctx.setEffectCallback);
export const useQueryKeysAsString = () => {
  // Will trigger a re-render when it changes but also makes sure to use the latest value in case some other render gets triggered first
  useSelector((ctx) => ctx.queryKeys);
  return useSelector((ctx) => queryKeysToString(ctx.queryKeysRef.current));
};
export const useQueryKeysAsStringAsRef = () => {
  const ref = useSelector((ctx) => ctx.queryKeysRef);

  // Creates a ref getter that uses the current value of the actual ref
  return useMemo(
    () => ({
      get current() {
        return queryKeysToString(ref.current);
      },
    }),
    [ref],
  );
};
export const useQueryKey = (key: string) => {
  // Will trigger a re-render when it changes but also makes sure to use the latest value in case some other render gets triggered first
  useSelector((ctx) => ctx.queryKeys[key]);
  return useSelector((ctx) => ctx.queryKeysRef.current[key]);
};

// Use this instead of the native one to avoid re-rendering whenever the route changes
export const useNavigate = () => useSelector((ctx) => ctx.navigateRef).current;

const getNavigationParams = (pathName: string): Context['params'] => {
  const matches = [
    matchPath('/instance/:partyId/:instanceGuid', pathName),
    matchPath('/instance/:partyId/:instanceGuid/:taskId', pathName),
    matchPath('/instance/:partyId/:instanceGuid/:taskId/:pageKey', pathName),
    matchPath('/:pageKey', pathName), // Stateless

    // Subform
    matchPath('/instance/:partyId/:instanceGuid/:taskId/:mainPageKey/:componentId', pathName),
    matchPath('/instance/:partyId/:instanceGuid/:taskId/:mainPageKey/:componentId/:dataElementId', pathName),
    matchPath('/instance/:partyId/:instanceGuid/:taskId/:mainPageKey/:componentId/:dataElementId/:pageKey', pathName),
  ];

  const partyId = matches.reduce((acc, match) => acc ?? match?.params['partyId'], undefined);
  const instanceGuid = matches.reduce((acc, match) => acc ?? match?.params['instanceGuid'], undefined);
  const taskId = matches.reduce((acc, match) => acc ?? match?.params['taskId'], undefined);
  const componentId = matches.reduce((acc, match) => acc ?? match?.params['componentId'], undefined);
  const dataElementId = matches.reduce((acc, match) => acc ?? match?.params['dataElementId'], undefined);
  const _pageKey = matches.reduce((acc, match) => acc ?? match?.params['pageKey'], undefined);
  const _mainPageKey = matches.reduce((acc, match) => acc ?? match?.params['mainPageKey'], undefined);
  const pageKey = _pageKey === undefined ? undefined : decodeURIComponent(_pageKey);
  const mainPageKey = _mainPageKey === undefined ? undefined : decodeURIComponent(_mainPageKey);

  const isSubformPage = !!mainPageKey;

  return {
    partyId,
    instanceGuid,
    taskId,
    pageKey,
    componentId,
    dataElementId,
    mainPageKey,
    isSubformPage,
  };
};

function UpdateParams() {
  const updateParams = useSelector((ctx) => ctx.updateParams);
  const paramsRef = useSelector((ctx) => ctx.paramsRef);
  const [params, setParams] = useState<Context['params'] | null>(null);

  useEffect(
    () =>
      router.subscribe((state) => {
        const newParams = getNavigationParams(state.location.pathname);
        paramsRef.current = newParams;
        setParams(newParams);
      }),
    [paramsRef],
  );

  useEffect(() => {
    params && updateParams(params);
  }, [params, updateParams]);

  return null;
}

function UpdateQueryKeys() {
  const updateQueryKeys = useSelector((ctx) => ctx.updateQueryKeys);
  const queryKeysRef = useSelector((ctx) => ctx.queryKeysRef);
  const [queryKeys, setQueryKeys] = useState<Context['queryKeys'] | null>(null);

  useEffect(
    () =>
      router.subscribe((state) => {
        const newQueryKeys = Object.fromEntries(new URLSearchParams(state.location.search).entries());
        queryKeysRef.current = newQueryKeys;
        setQueryKeys(newQueryKeys);
      }),
    [queryKeysRef],
  );

  useEffect(() => {
    queryKeys && updateQueryKeys(queryKeys);
  }, [queryKeys, updateQueryKeys]);

  return null;
}

function UpdateNavigate() {
  const navigateRef = useSelector((ctx) => ctx.navigateRef);
  navigateRef.current = useNativeNavigate();

  return null;
}

function queryKeysToString(qc: Context['queryKeys']): string {
  const qcFiltered = Object.fromEntries(Object.entries(qc).filter(filterUndefined));
  if (Object.keys(qcFiltered).length === 0) {
    return '';
  }

  const searchParams = new URLSearchParams(qcFiltered);
  return `?${searchParams.toString()}`;
}

function filterUndefined(obj: [string, string | undefined]): obj is [string, string] {
  return obj[1] !== undefined;
}
