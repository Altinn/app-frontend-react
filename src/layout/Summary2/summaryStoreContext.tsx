import React, { createContext, useContext } from 'react';

import { create } from 'zustand';

import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface SummaryTaskState {
  summaryNode: LayoutNode<'Summary2'>;
}

type Summary2StoreProviderProps = React.PropsWithChildren & SummaryTaskState;

const createSummary2Store = (summaryNode: LayoutNode<'Summary2'>) =>
  create<SummaryTaskState>((set) => ({
    summaryNode,
    setSummaryNode: (summaryNode: LayoutNode<'Summary2'>) => set((state) => ({ ...state, summaryNode })),
  }));

const StoreContext = createContext<ReturnType<typeof createSummary2Store> | null>(null);

export function Summary2StoreProvider({ children, summaryNode }: Summary2StoreProviderProps) {
  const store = createSummary2Store(summaryNode);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export const useSummary2Store = <T,>(selector: (state: SummaryTaskState) => T): T => {
  const store = useContext(StoreContext);
  if (!store) {
    return {} as T;
  }
  return store(selector);
};
