import React, { useCallback, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';
import type { CompGroupRepeatingInternal } from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';

interface RepeatingGroupEditRowContext {
  multiPageEnabled: boolean;
  multiPageIndex: number;
  nextMultiPage: () => void;
  prevMultiPage: () => void;
  hasNextMultiPage: boolean;
  hasPrevMultiPage: boolean;
}

const { Provider, useCtx } = createContext<RepeatingGroupEditRowContext>({
  name: 'RepeatingGroupEditRow',
  required: true,
});

function useRepeatingGroupEditRowState(
  node: LayoutNodeForGroup<CompGroupRepeatingInternal>,
  editIndex: number,
): RepeatingGroupEditRowContext {
  const multiPageEnabled = node.item.edit?.multiPage ?? false;
  const lastPage = useMemo(() => {
    const row = node.item.rows[editIndex];
    let lastPage = 0;
    for (const childNode of row.items) {
      lastPage = Math.max(lastPage, childNode.item.multiPageIndex ?? 0);
    }
    return lastPage;
  }, [editIndex, node.item.rows]);

  const [multiPageIndex, setMultiPageIndex] = useState(0);

  const nextMultiPage = useCallback(() => {
    setMultiPageIndex((prev) => Math.min(prev + 1, lastPage));
  }, [lastPage]);

  const prevMultiPage = useCallback(() => {
    setMultiPageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  return {
    multiPageEnabled,
    multiPageIndex,
    nextMultiPage,
    prevMultiPage,
    hasNextMultiPage: multiPageEnabled && multiPageIndex < lastPage,
    hasPrevMultiPage: multiPageEnabled && multiPageIndex > 0,
  };
}

interface Props {
  node: LayoutNodeForGroup<CompGroupRepeatingInternal>;
  editIndex: number;
}

export function RepeatingGroupEditRowProvider({ node, editIndex, children }: PropsWithChildren<Props>) {
  const state = useRepeatingGroupEditRowState(node, editIndex);
  return <Provider value={state}>{children}</Provider>;
}

export const useRepeatingGroupEdit = () => useCtx();
