import React, { createContext, useEffect, useReducer, useRef } from 'react';
import type { PropsWithChildren } from 'react';

type Action = 'INCREMENT_EMPTY' | 'DECREMENT_EMPTY' | 'INCREMENT_NOT_EMPTY' | 'DECREMENT_NOT_EMPTY';

export interface EmptyChildrenContext {
  parent?: EmptyChildrenContext;
  onlyEmptyChildren: boolean;
  dispatch: React.Dispatch<Action>;
}

const Context = createContext<EmptyChildrenContext | undefined>(undefined);

/**
 * This boundary will keep track of summary components rendered within it, counting how many are empty and how many
 * are not empty. This is used to hide summaries for groups/containers where all children are empty. By storing this
 * in a context and counting them, the components themselves can self-report their emptiness-state. That way we don't
 * have to implement a method for a container-component to 'reach down into' their child components to find out if
 * they are empty or not.
 */
export function EmptyChildrenBoundary({ children }: PropsWithChildren) {
  const parent = React.useContext(Context);
  const countsRef = useRef({ empty: 0, notEmpty: 0 });

  const [onlyEmptyChildren, dispatch] = useReducer((_prevState: boolean, action: Action): boolean => {
    switch (action) {
      case 'INCREMENT_EMPTY':
        countsRef.current.empty += 1;
        break;
      case 'DECREMENT_EMPTY':
        countsRef.current.empty -= 1;
        break;
      case 'INCREMENT_NOT_EMPTY':
        countsRef.current.notEmpty += 1;
        break;
      case 'DECREMENT_NOT_EMPTY':
        countsRef.current.notEmpty -= 1;
        break;
    }

    const newEmpty = countsRef.current.empty;
    const newNotEmpty = countsRef.current.notEmpty;
    const total = newEmpty + newNotEmpty;

    const isInitialRender = total === 0;
    return !isInitialRender && newEmpty === total;
  }, false);

  return <Context.Provider value={{ parent, onlyEmptyChildren, dispatch }}>{children}</Context.Provider>;
}

export function useHasOnlyEmptyChildren() {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error('useHasOnlyEmptyChildren must be used within a EmptyChildrenBoundary');
  }

  return context.onlyEmptyChildren;
}

function useMarkRendering(ctx: EmptyChildrenContext | undefined, isEmpty: boolean) {
  const dispatch = ctx?.dispatch;

  useEffect(() => {
    dispatch?.(isEmpty ? 'INCREMENT_EMPTY' : 'INCREMENT_NOT_EMPTY');

    return () => {
      dispatch?.(isEmpty ? 'DECREMENT_EMPTY' : 'DECREMENT_NOT_EMPTY');
    };
  }, [dispatch, isEmpty]);
}

export function useReportSummaryEmptyRender(isEmpty: boolean) {
  const ctx = React.useContext(Context);
  useMarkRendering(ctx, isEmpty);
}

export function useReportSummaryEmptyRenderOnParent(isEmpty: boolean) {
  const ctx = React.useContext(Context);
  useMarkRendering(ctx?.parent, isEmpty);
}
