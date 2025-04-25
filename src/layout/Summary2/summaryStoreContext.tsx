import React, { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { AnySummaryOverrideProps, CompSummary2External } from 'src/layout/Summary2/config.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

type Summary2State = Pick<CompSummary2External, 'hideEmptyFields' | 'showPageInAccordion' | 'overrides' | 'isCompact'>;
const StoreContext = createContext<Summary2State | null>(null);

export function Summary2StoreProvider({ children, node }: PropsWithChildren<{ node: LayoutNode<'Summary2'> }>) {
  const hideEmptyFields = useNodeItem(node, (i) => i.hideEmptyFields);
  const showPageInAccordion = useNodeItem(node, (i) => i.showPageInAccordion);
  const overrides = useNodeItem(node, (i) => i.overrides);
  const isCompact = useNodeItem(node, (i) => i.isCompact);

  return (
    <StoreContext.Provider value={{ hideEmptyFields, showPageInAccordion, overrides, isCompact }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useSummary2Prop<K extends keyof Summary2State>(prop: K): Summary2State[K] | undefined {
  const state = useContext(StoreContext);
  if (!state) {
    throw new Error('useSummary2Prop must be used within a Summary2StoreProvider');
  }

  return state[prop];
}

export function useSummary2Overrides(componentId: string): AnySummaryOverrideProps | undefined {
  const overrides = useSummary2Prop('overrides');
  return overrides?.find((o) => o.componentId === componentId);
}
