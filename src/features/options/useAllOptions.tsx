import React, { useCallback, useEffect, useState } from 'react';
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
type State = { map: AllOptionsMap; initiallyLoaded: boolean };

export const allOptions: AllOptionsMap = {};

const [Provider, useCtx] = createStrictContext<State>();

export const useAllOptions = () => useCtx().map;
export const useAllOptionsInitiallyLoaded = () => useCtx().initiallyLoaded;

export function AllOptionsProvider({ children }: PropsWithChildren) {
  const nodes = useExprContext();
  const nodesWithOptions: LayoutNode[] = [];
  const [numInitialFetchesDone, setNumInitialFetchesDone] = useState(0);

  const loadingDone = useCallback(() => {
    setNumInitialFetchesDone((prev) => prev + 1);
  }, []);

  for (const node of nodes?.allNodes() || []) {
    if (
      ('options' in node.item && node.item.options) ||
      ('optionsId' in node.item && node.item.optionsId) ||
      ('source' in node.item && node.item.source)
    ) {
      nodesWithOptions.push(node);
    }
  }

  const initiallyLoaded = numInitialFetchesDone === nodesWithOptions.length;

  return (
    <>
      {nodesWithOptions.map((node) => (
        <DummyOptionsSaver
          key={node.item.id}
          node={node}
          loadingDone={loadingDone}
        />
      ))}
      <Provider
        value={{
          map: allOptions,
          initiallyLoaded,
        }}
      >
        {children}
      </Provider>
    </>
  );
}

function DummyOptionsSaver({ node, loadingDone }: { node: LayoutNode; loadingDone: () => void }) {
  const [initiallyFetched, setInitiallyFetched] = useState(false);
  const { options: calculatedOptions, isFetching } = useGetOptions({
    ...node.item,
    node,
    formData: {
      // No need to implement support for preselectedOptionsIndex
      disable: 'I have read the code and know that core functionality will be missing',
    },
  });

  if (!isFetching) {
    allOptions[node.item.id] = calculatedOptions;
    if (!initiallyFetched) {
      setInitiallyFetched(true);
    }
  }

  useEffect(() => {
    if (initiallyFetched) {
      loadingDone();
    }
  }, [initiallyFetched, loadingDone]);

  return <></>;
}
