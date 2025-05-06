import React, { createContext, useState } from 'react';
import type { PropsWithChildren } from 'react';

export interface EmptyChildrenContext {
  empty: number;
  notEmpty: number;
  total: number;
  renderedEmptyComponent: () => void;
  renderedNotEmptyComponent: () => void;
}

const Context = createContext<EmptyChildrenContext | undefined>(undefined);

export function EmptyChildrenProvider({ children }: PropsWithChildren) {
  const [empty, setNumEmpty] = useState(0);
  const [notEmpty, setNumNotEmpty] = useState(0);
  const renderedEmptyComponent = () => setNumEmpty((n) => n + 1);
  const renderedNotEmptyComponent = () => setNumNotEmpty((n) => n + 1);

  return (
    <Context.Provider
      value={{
        empty,
        notEmpty,
        total: empty + notEmpty,
        renderedEmptyComponent,
        renderedNotEmptyComponent,
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

export function useRegisterSummary2Child(): Pick<
  EmptyChildrenContext,
  'renderedEmptyComponent' | 'renderedNotEmptyComponent'
> {
  const context = React.useContext(Context);

  if (context) {
    return {
      renderedEmptyComponent: context.renderedEmptyComponent,
      renderedNotEmptyComponent: context.renderedNotEmptyComponent,
    };
  }

  return {
    renderedEmptyComponent: () => {},
    renderedNotEmptyComponent: () => {},
  };
}
