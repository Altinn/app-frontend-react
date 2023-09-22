import React, { useEffect, useReducer } from 'react';
import type { PropsWithChildren } from 'react';

import { useGetOptions } from 'src/features/options/useGetOptions';
import { useAppSelector } from 'src/hooks/useAppSelector';
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

interface NodeOptionsInitiallyFetchedMap {
  allFetched: boolean;
  currentTaskId?: string;
  nodes: { [nodeId: string]: boolean };
}
type Actions =
  | { type: 'nodeFetched'; nodeId: string }
  | { type: 'nodesFound'; nodesFound: string[] }
  | { type: 'setCurrentTask'; currentTaskId: string | undefined };

const reducer = (state: NodeOptionsInitiallyFetchedMap, action: Actions) => {
  if (action.type === 'nodeFetched') {
    if (state.nodes[action.nodeId]) {
      return state;
    }
    const newNodes = {
      ...state.nodes,
      [action.nodeId]: true,
    };
    const allFetched = Object.values(newNodes).every((v) => v);
    return {
      ...state,
      allFetched,
      nodes: newNodes,
    };
  } else if (action.type === 'nodesFound') {
    if (state.allFetched) {
      return state;
    }

    const newNodes = { ...state.nodes };
    let changes = false;
    for (const nodeId of action.nodesFound) {
      if (newNodes[nodeId] === undefined) {
        newNodes[nodeId] = false;
        changes = true;
      }
    }
    if (!changes) {
      return state;
    }
    return {
      ...state,
      allFetched: false,
      nodes: newNodes,
    };
  } else if (action.type === 'setCurrentTask') {
    if (state.currentTaskId === action.currentTaskId) {
      return state;
    }

    return {
      allFetched: false,
      currentTaskId: action.currentTaskId,
      nodes: {},
    };
  }

  return state;
};

export function AllOptionsProvider({ children }: PropsWithChildren) {
  const nodes = useExprContext();
  const currentTaskId = useAppSelector((state) => state.process.taskId) ?? undefined;
  const [state, dispatch] = useReducer(reducer, { allFetched: false, currentTaskId, nodes: {} });

  useEffect(() => {
    dispatch({ type: 'setCurrentTask', currentTaskId });
  }, [currentTaskId]);

  useEffect(() => {
    const nodesFound: string[] = [];
    for (const node of nodes?.allNodes() || []) {
      if (
        ('options' in node.item && node.item.options) ||
        ('optionsId' in node.item && node.item.optionsId) ||
        ('source' in node.item && node.item.source)
      ) {
        nodesFound.push(node.item.id);
      }
    }
    dispatch({
      type: 'nodesFound',
      nodesFound,
    });
  }, [nodes]);

  return (
    <>
      {Object.keys(state.nodes).map((nodeId) => {
        const node = nodes?.findById(nodeId);
        if (!node) {
          return null;
        }
        return (
          <DummyOptionsSaver
            key={nodeId}
            node={node}
            loadingDone={() => {
              if (state.nodes[nodeId]) {
                return;
              }

              dispatch({
                type: 'nodeFetched',
                nodeId,
              });
            }}
          />
        );
      })}
      <Provider
        value={{
          map: allOptions,
          initiallyLoaded: Object.keys(state.nodes).length === 0 ? true : state.allFetched,
        }}
      >
        {children}
      </Provider>
    </>
  );
}

function DummyOptionsSaver({ node, loadingDone }: { node: LayoutNode; loadingDone: () => void }) {
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
    loadingDone();
  }

  return <></>;
}
