import React from 'react';
import type { PropsWithChildren } from 'react';

import { useGetOptions } from 'src/features/options/useGetOptions';
import { createStrictContext } from 'src/utils/createStrictContext';
import { useExprContext } from 'src/utils/layout/ExprContext';
import type { IOption } from 'src/layout/common.generated';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

/**
 * This file contains a Context that provides a global map of all options that have been fetched.
 * This is used in expressions and useDisplayData(), and will make sure to fetch all options even before
 * the page with the option-based component is rendered. This way we can use the 'displayValue' expression
 * function, and show summaries/PDF even if the source component has not been rendered yet.
 */
export type AllOptionsMap = { [componentId: string]: IOption[] | undefined };
export const allOptions: AllOptionsMap = {};

const [Provider, useCtx] = createStrictContext<AllOptionsMap>();

export const useAllOptionsContext = useCtx;

export function AllOptionsProvider({ children }: PropsWithChildren) {
  const nodes = useExprContext();
  const nodesWithOptions: LayoutNode[] = [];

  for (const node of nodes?.allNodes() || []) {
    if (
      ('options' in node.item && node.item.options) ||
      ('optionsId' in node.item && node.item.optionsId) ||
      ('source' in node.item && node.item.source)
    ) {
      nodesWithOptions.push(node);
    }
  }

  return (
    <Provider value={allOptions}>
      {children}
      {nodesWithOptions.map((node) => (
        <DummyOptionsSaver
          key={node.item.id}
          node={node}
        />
      ))}
    </Provider>
  );
}

function DummyOptionsSaver({ node }: { node: LayoutNode }) {
  const { options: calculatedOptions } = useGetOptions({
    ...node.item,
    node,
    formData: {
      // No need to implement support for preselectedOptionsIndex
      disable: 'I have read the code and know that core functionality will be missing',
    },
  });

  allOptions[node.item.id] = calculatedOptions;
  return <></>;
}
