import React, { createContext, useEffect, useState } from 'react';
import type { JSX, PropsWithChildren } from 'react';

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
  render?: (style: React.CSSProperties) => JSX.Element;
}

export function HideWhenAllChildrenEmpty({ children, when, render }: HideWhenAllChildrenEmptyProps) {
  const hasOnlyEmptyChildren = useHasOnlyEmptyChildren();

  if (hasOnlyEmptyChildren && (when === undefined || when)) {
    // We still have to render out the actual children, otherwise the unmount effect would just decrement the number
    // of empty components and we'd bounce back to the initial state. Without this, and the unmount effect, the children
    // could never report changes and go from being empty to not being empty anymore.
    if (render) {
      return render({ display: 'none', visibility: 'hidden' });
    }
    return <div style={{ display: 'none', visibility: 'hidden' }}>{children}</div>;
  }

  if (render) {
    return render({});
  }

  return <div>{children}</div>;
}

function useMarkRendering(ctx: EmptyChildrenContext | undefined, isEmpty: boolean) {
  const setNumEmpty = ctx?.setNumEmpty;
  const setNumNotEmpty = ctx?.setNumNotEmpty;

  // Using setTimeout instead of useEffect because it's faster and will have a better chance to set this state before
  // rendering has finished. By setting this state earlier, we get a chance to add more to the render queue and delay
  // the flush to DOM, which makes sure we reach the correct state before rendering the PDF.
  setTimeout(() => {
    if (isEmpty) {
      setNumEmpty?.((e) => e + 1);
    } else {
      setNumNotEmpty?.((e) => e + 1);
    }
  }, 4);

  useEffect(
    () =>
      // Revert changes when unmounting, in case data changes
      () => {
        if (isEmpty) {
          setNumEmpty?.((e) => e - 1);
        } else {
          setNumNotEmpty?.((e) => e - 1);
        }
      },
    [setNumEmpty, setNumNotEmpty, isEmpty],
  );
}

export function useReportSummaryEmptyRender(isEmpty: boolean) {
  const ctx = React.useContext(Context);
  useMarkRendering(ctx, isEmpty);
}

export function useReportSummaryEmptyRenderOnParent(isEmpty: boolean) {
  const ctx = React.useContext(Context);
  useMarkRendering(ctx?.parent, isEmpty);
}
