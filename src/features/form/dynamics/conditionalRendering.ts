import deepEqual from 'fast-deep-equal';

import { evalExpr } from 'src/features/expressions';
import { ExprVal } from 'src/features/expressions/types';
import type { ContextDataSources } from 'src/features/expressions/ExprContext';
import type { ExprConfig } from 'src/features/expressions/types';
import type { IHiddenLayoutsExternal } from 'src/types';
import type { LayoutPages } from 'src/utils/layout/LayoutPages';

// TODO: Move this to run in NodesGenerator.tsx, run the expressions to hide/unhide the page
// in the Page component there.
export function runHiddenExpressionsForPages(
  nodes: LayoutPages,
  hiddenLayoutsExpr: IHiddenLayoutsExternal,
  dataSources: ContextDataSources,
): Set<string> {
  const config: ExprConfig<ExprVal.Boolean> = {
    returnType: ExprVal.Boolean,
    defaultValue: false,
  };

  const hiddenLayouts: Set<string> = new Set();
  for (const key of Object.keys(hiddenLayoutsExpr)) {
    const layout = nodes.findLayout(key);
    if (!layout) {
      continue;
    }

    let isHidden = hiddenLayoutsExpr[key];
    if (typeof isHidden === 'object' && isHidden !== null) {
      isHidden = evalExpr(isHidden, layout, dataSources, { config }) as boolean;
    }
    if (isHidden === true) {
      hiddenLayouts.add(key);
    }
  }

  return hiddenLayouts;
}

// TODO: Move this code with it:
// Add all fields from hidden layouts to hidden fields
// for (const layout of futureHiddenLayouts) {
//   for (const node of resolvedNodes.findLayout(layout)?.flat() || []) {
//     if (!futureHiddenFields.has(node.getId())) {
//       futureHiddenFields.add(node.getId());
//     }
//   }
// }

export function shouldUpdate(currentList: Set<string>, newList: Set<string>): boolean {
  if (currentList.size !== newList.size) {
    return true;
  }

  const present = [...currentList.values()].sort();
  const future = [...newList.values()].sort();

  return !deepEqual(present, future);
}
