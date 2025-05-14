import React, { createContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

export interface EmptyChildrenContext {
  parent?: EmptyChildrenContext;
  empty: number;
  notEmpty: number;
  total: number;
  setNumEmpty: React.Dispatch<React.SetStateAction<number>>;
  setNumNotEmpty: React.Dispatch<React.SetStateAction<number>>;
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
  const [empty, setNumEmpty] = useState(0);
  const [notEmpty, setNumNotEmpty] = useState(0);

  return (
    <Context.Provider
      value={{
        parent,
        empty,
        notEmpty,
        total: empty + notEmpty,
        setNumEmpty,
        setNumNotEmpty,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useHasOnlyEmptyChildren() {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error('useHasOnlyEmptyChildren must be used within a EmptyChildrenBoundary');
  }

  const isInitialRender = context.total === 0 && context.empty === 0 && context.notEmpty === 0;
  if (isInitialRender) {
    // If we returned true here, that would likely short-circuit the entire thing and we'd end up never rendering out
    // any children after all.
    return false;
  }

  return context.empty === context.total;
}

function useMarkRendering(ctx: EmptyChildrenContext | undefined, isEmpty: boolean) {
  const setNumEmpty = ctx?.setNumEmpty;
  const setNumNotEmpty = ctx?.setNumNotEmpty;

  useEffect(() => {
    if (isEmpty) {
      setNumEmpty?.((e) => e + 1);
    } else {
      setNumNotEmpty?.((e) => e + 1);
    }

    // Revert changes when unmounting, in case data changes
    return () => {
      if (isEmpty) {
        setNumEmpty?.((e) => e - 1);
      } else {
        setNumNotEmpty?.((e) => e - 1);
      }
    };
  }, [setNumEmpty, setNumNotEmpty, isEmpty]);
}

export function useReportSummaryEmptyRender(isEmpty: boolean) {
  const ctx = React.useContext(Context);
  useMarkRendering(ctx, isEmpty);
}

export function useReportSummaryEmptyRenderOnParent(isEmpty: boolean) {
  const ctx = React.useContext(Context);
  useMarkRendering(ctx?.parent, isEmpty);
}
