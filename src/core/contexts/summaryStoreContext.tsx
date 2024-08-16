import React, { createContext, useContext } from 'react';

import { createTaskStore } from 'src/core/contexts/taskStoreContext';
import type { TaskState } from 'src/core/contexts/taskStoreContext';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface SummaryTaskState extends TaskState {
  summaryNode: LayoutNode<'Summary2'>;
}

interface Summary2StoreProviderProps extends React.PropsWithChildren {
  summaryNode: LayoutNode<'Summary2'>;
}

const SummaryStoreContext = createContext<ReturnType<typeof createTaskStore<SummaryTaskState>> | null>(null);

export function Summary2StoreProvider({ children, summaryNode }: Summary2StoreProviderProps) {
  const store = createTaskStore<SummaryTaskState>({ summaryNode });

  return <SummaryStoreContext.Provider value={store}>{children}</SummaryStoreContext.Provider>;
}

export const useSummaryStore = <T,>(selector: (state: SummaryTaskState) => T): T => {
  const store = useContext(SummaryStoreContext);
  if (!store) {
    return {} as T;
  }
  return store(selector);
};
