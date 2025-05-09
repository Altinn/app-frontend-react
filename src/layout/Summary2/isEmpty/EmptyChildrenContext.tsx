import React, { createContext, useEffect, useState } from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

export interface EmptyChildrenContext {
  parent?: EmptyChildrenContext;
  empty: number;
  notEmpty: number;
  total: number;
  setNumEmpty: React.Dispatch<React.SetStateAction<number>>;
  setNumNotEmpty: React.Dispatch<React.SetStateAction<number>>;
}

const Context = createContext<EmptyChildrenContext | undefined>(undefined);

export function EmptyChildrenProvider({ children }: PropsWithChildren) {
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
    throw new Error('useHasOnlyEmptyChildren must be used within a EmptyChildrenProvider');
  }

  const isInitialRender = context.total === 0 && context.empty === 0 && context.notEmpty === 0;
  if (isInitialRender) {
    // If we returned true here, that would likely short-circuit the entire thing and we'd end up never rendering out
    // any children after all.
    return false;
  }

  return context.empty === context.total;
}

interface HideWhenAllChildrenEmptyProps extends PropsWithChildren {
  when?: boolean;
  tag?: FunctionComponent<{ style?: React.CSSProperties }>;
}

export function HideWhenAllChildrenEmpty({ children, when, tag }: HideWhenAllChildrenEmptyProps) {
  const hasOnlyEmptyChildren = useHasOnlyEmptyChildren();

  // We still have to render out the actual children, otherwise the unmount effect would just decrement the number
  // of empty components and we'd bounce back to the initial state. Without this, and the unmount effect, the children
  // could never report changes and go from being empty to not being empty anymore.

  if (hasOnlyEmptyChildren && (when === undefined || when) && !tag) {
    return <div style={{ display: 'none' }}>{children}</div>;
  }

  if (hasOnlyEmptyChildren && (when === undefined || when) && tag) {
    return React.createElement(tag, { style: { display: 'none' } }, children);
  }

  return children;
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
