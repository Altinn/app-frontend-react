import React, { useEffect } from 'react';
import { useLocation, useMatch } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { createStore } from 'zustand';

import { createZustandContext } from 'src/core/contexts/zustandContext';

export type NavigationEffectCb = () => void;
interface Context {
  params: {
    partyId?: string;
    instanceGuid?: string;
    taskId?: string;
    pageKey?: string;
  };
  queryKeys: {
    [key: string]: string | undefined;
  };
  updateParams: (params: Context['params']) => void;
  updateQueryKeys: (queryKeys: Context['queryKeys']) => void;
  effectCallback: NavigationEffectCb | null;
  setEffectCallback: (cb: NavigationEffectCb | null) => void;
}

function newStore() {
  return createStore<Context>((set) => ({
    params: {},
    queryKeys: {},
    updateParams: (params) => set({ params }),
    updateQueryKeys: (queryKeys) => set({ queryKeys }),
    effectCallback: null,
    setEffectCallback: (effectCallback: NavigationEffectCb) => set({ effectCallback }),
  }));
}

const { Provider, useSelector, useSelectorAsRef } = createZustandContext<ReturnType<typeof newStore>>({
  name: 'AppRouting',
  required: true,
  initialCreateStore: newStore,
});

export function AppRoutingProvider({ children }: PropsWithChildren) {
  return (
    <Provider>
      <UpdateParams />
      <UpdateQueryKeys />
      {children}
    </Provider>
  );
}

export const useAllNavigationParamsAsRef = () => useSelectorAsRef((ctx) => ctx.params);
export const useNavigationParam = (key: keyof Context['params']) => useSelector((ctx) => ctx.params[key]);
export const useNavigationEffect = () => useSelector((ctx) => ctx.effectCallback);
export const useSetNavigationEffect = () => useSelector((ctx) => ctx.setEffectCallback);
export const useQueryKeysAsString = () => useSelector((ctx) => queryKeysToString(ctx.queryKeys));
export const useQueryKeysAsStringAsRef = () => useSelectorAsRef((ctx) => queryKeysToString(ctx.queryKeys));
export const useQueryKey = (key: string) => useSelector((ctx) => ctx.queryKeys[key]);

const useNavigationParams = (): Context['params'] => {
  const instanceMatch = useMatch('/instance/:partyId/:instanceGuid');
  const taskIdMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId');
  const pageKeyMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId/:pageKey');
  const statelessMatch = useMatch('/:pageKey');

  const partyId = pageKeyMatch?.params.partyId ?? taskIdMatch?.params.partyId ?? instanceMatch?.params.partyId;
  const instanceGuid =
    pageKeyMatch?.params.instanceGuid ?? taskIdMatch?.params.instanceGuid ?? instanceMatch?.params.instanceGuid;
  const taskId = pageKeyMatch?.params.taskId ?? taskIdMatch?.params.taskId;
  const _pageKey = pageKeyMatch?.params.pageKey ?? statelessMatch?.params.pageKey;
  const pageKey = _pageKey === undefined ? undefined : decodeURIComponent(_pageKey);

  return {
    partyId,
    instanceGuid,
    taskId,
    pageKey,
  };
};

function UpdateParams() {
  const updateParams = useSelector((ctx) => ctx.updateParams);
  const params = useNavigationParams();

  useEffect(() => {
    updateParams(params);
  }, [params, updateParams]);

  return null;
}

function UpdateQueryKeys() {
  const queryKeys = useLocation().search ?? '';
  const updateQueryKeys = useSelector((ctx) => ctx.updateQueryKeys);

  useEffect(() => {
    const map = Object.fromEntries(new URLSearchParams(queryKeys).entries());
    updateQueryKeys(map);
  }, [queryKeys, updateQueryKeys]);

  return null;
}

function queryKeysToString(qc: Context['queryKeys']): string {
  const keys = Object.keys(qc);
  if (keys.length === 0) {
    return '';
  }

  const keysAndValues = keys.map((key) => `${key}=${encodeURIComponent(qc[key]!)}`);
  return `?${keysAndValues.join('&')}`;
}
