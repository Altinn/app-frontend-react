import React, { useEffect } from 'react';
import { matchPath, useLocation, useNavigate as useNativeNavigate } from 'react-router-dom';
import type { MutableRefObject, PropsWithChildren } from 'react';

import { createStore } from 'zustand';

import { createZustandContext } from 'src/core/contexts/zustandContext';

export type NavigationEffectCb = () => void;

interface PathParams {
  partyId?: string;
  instanceGuid?: string;
  taskId?: string;
  pageKey?: string;
  componentId?: string;
  dataElementId?: string;
  mainPageKey?: string;
}

export enum SearchParams {
  FocusComponentId = 'focusComponentId',
  ExitSubform = 'exitSubform',
  Validate = 'validate',
  Pdf = 'pdf',
}

interface Context {
  hash: string;
  updateHash: (hash: string) => void;
  effectCallback: NavigationEffectCb | null;
  setEffectCallback: (cb: NavigationEffectCb | null) => void;
  navigateRef: MutableRefObject<ReturnType<typeof useNativeNavigate>>;
}

function newStore() {
  return createStore<Context>((set) => ({
    hash: `${window.location.hash}`,
    updateHash: (hash: string) => set({ hash }),
    effectCallback: null,
    setEffectCallback: (effectCallback: NavigationEffectCb) => set({ effectCallback }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigateRef: { current: undefined as any },
  }));
}

const { Provider, useSelector, useStaticSelector } = createZustandContext<ReturnType<typeof newStore>>({
  name: 'AppRouting',
  required: true,
  initialCreateStore: newStore,
});

export function AppRoutingProvider({ children }: PropsWithChildren) {
  return (
    <Provider>
      <UpdateHash />
      <UpdateNavigate />
      {children}
    </Provider>
  );
}

/**
 * This pretends to be a ref, but it's actually a getter that returns the current value (executes the getter each
 * time you access the `current` property).
 */
class OnDemandRef<T> {
  constructor(private readonly getter: () => T) {}

  get current() {
    return this.getter();
  }
}

function useStaticRef<T>(getter: () => T) {
  return new OnDemandRef(getter) as { current: T };
}

function getPath(): string {
  const path = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  return path.split('?')[0];
}

function getSearch(): string {
  return window.location.hash.split('?')[1] ?? '';
}

export const useQueryKeysAsStringAsRef = () => useStaticRef(() => getSearch());
export const useAllNavigationParamsAsRef = () => useStaticRef(() => matchParams(getPath()));

export const useNavigationParam = <T extends keyof PathParams>(key: T) =>
  useSelector(() => {
    const path = getPath();
    const matches = matchers.map((matcher) => matchPath(matcher, path));
    return paramFrom(matches, key) as PathParams[T];
  });

export const useNavigationParams = () => useSelector(() => matchParams(getPath()));
export const useNavigationEffect = () => useSelector((ctx) => ctx.effectCallback);
export const useSetNavigationEffect = () => useSelector((ctx) => ctx.setEffectCallback);
export const useQueryKeysAsString = () => useSelector(() => getSearch());
export const useQueryKey = (key: SearchParams) => useSelector(() => new URLSearchParams(getSearch()).get(key));

export const useIsSubformPage = () =>
  useSelector(() => {
    const path = getPath();
    const matches = matchers.map((matcher) => matchPath(matcher, path));
    return !!paramFrom(matches, 'mainPageKey');
  });

// Use this instead of the native one to avoid re-rendering whenever the route changes
export const useNavigate = () => useSelector((ctx) => ctx.navigateRef).current;

const matchers: string[] = [
  '/instance/:partyId/:instanceGuid',
  '/instance/:partyId/:instanceGuid/:taskId',
  '/instance/:partyId/:instanceGuid/:taskId/:pageKey',
  '/:pageKey', // Stateless

  // Subform
  '/instance/:partyId/:instanceGuid/:taskId/:mainPageKey/:componentId',
  '/instance/:partyId/:instanceGuid/:taskId/:mainPageKey/:componentId/:dataElementId',
  '/instance/:partyId/:instanceGuid/:taskId/:mainPageKey/:componentId/:dataElementId/:pageKey',
];

type Matches = ReturnType<typeof matchPath>[];

const requiresDecoding: Set<keyof PathParams> = new Set(['pageKey', 'mainPageKey']);

function paramFrom(matches: Matches, key: keyof PathParams): string | undefined {
  const param = matches.reduce((acc, match) => acc ?? match?.params[key], undefined);
  const decode = requiresDecoding.has(key);
  return decode && param ? decodeURIComponent(param) : param;
}

function matchParams(path: string): PathParams {
  const matches = matchers.map((matcher) => matchPath(matcher, path));
  return {
    partyId: paramFrom(matches, 'partyId'),
    instanceGuid: paramFrom(matches, 'instanceGuid'),
    taskId: paramFrom(matches, 'taskId'),
    pageKey: paramFrom(matches, 'pageKey'),
    componentId: paramFrom(matches, 'componentId'),
    dataElementId: paramFrom(matches, 'dataElementId'),
    mainPageKey: paramFrom(matches, 'mainPageKey'),
  };
}

function UpdateHash() {
  const updateHash = useStaticSelector((ctx) => ctx.updateHash);
  const hash = useLocation().hash;

  useEffect(() => {
    updateHash(hash);
  }, [hash, updateHash]);

  return null;
}

function UpdateNavigate() {
  const navigateRef = useSelector((ctx) => ctx.navigateRef);
  navigateRef.current = useNativeNavigate();

  return null;
}
