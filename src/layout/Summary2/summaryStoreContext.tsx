import React, { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

import { useNodeItem } from 'src/utils/layout/useNodeItem';
import type { CompSummaryOverrides, CompTypes } from 'src/layout/layout';
import type { CompSummary2External } from 'src/layout/Summary2/config.generated';
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

export function useSummaryProp<K extends keyof Summary2State>(prop: K): Summary2State[K] | undefined {
  const state = useContext(StoreContext);
  if (!state) {
    // This may happen in, for example, subform summaries (where we don't always have the Summary2 component)
    return undefined;
  }

  return state[prop];
}

export function useSummaryOverrides<Type extends CompTypes>(
  node: LayoutNode<Type>,
): CompSummaryOverrides<Type> | undefined {
  const overrides = useSummaryProp('overrides');
  return overrides?.find((o) => o.componentId === node.baseId);
}
