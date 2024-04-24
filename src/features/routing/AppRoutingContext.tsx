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
    queryKeys: string;
  };
  updateParams: (params: Context['params']) => void;
  effectCallback: NavigationEffectCb | null;
  setEffectCallback: (cb: NavigationEffectCb | null) => void;
}

function newStore() {
  return createStore<Context>((set) => ({
    params: {
      queryKeys: '',
    },
    updateParams: (params) => set({ params }),
    effectCallback: null,
    setEffectCallback: (effectCallback: NavigationEffectCb) => set({ effectCallback }),
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
      {children}
    </Provider>
  );
}

export const useAllNavigationParams = () => useSelector((ctx) => ctx.params);
export const useNavigationParam = (key: keyof Context['params']) => useSelector((ctx) => ctx.params[key]);
export const useNavigationEffect = () => useSelector((ctx) => ctx.effectCallback);
export const useSetNavigationEffect = () => useSelector((ctx) => ctx.setEffectCallback);

const useNavigationParams = () => {
  const instanceMatch = useMatch('/instance/:partyId/:instanceGuid');
  const taskIdMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId');
  const pageKeyMatch = useMatch('/instance/:partyId/:instanceGuid/:taskId/:pageKey');
  const statelessMatch = useMatch('/:pageKey');
  const queryKeys = useLocation().search ?? '';

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
    queryKeys,
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
