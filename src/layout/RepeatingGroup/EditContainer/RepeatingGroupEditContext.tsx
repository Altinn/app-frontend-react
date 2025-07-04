import React, { useCallback, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';
import { useLayoutLookups } from 'src/features/form/layout/LayoutsContext';
import { useRegisterNavigationHandler } from 'src/features/form/layout/NavigateToNode';
import { useRepeatingGroupComponentId } from 'src/layout/RepeatingGroup/Providers/RepeatingGroupContext';
import { RepGroupHooks } from 'src/layout/RepeatingGroup/utils';
import { useExternalItem } from 'src/utils/layout/hooks';
import type { ParentRef } from 'src/features/form/layout/makeLayoutLookups';

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
  baseComponentId: string,
): RepeatingGroupEditRowContext & { setMultiPageIndex: (index: number) => void } {
  const lastPage = RepGroupHooks.useLastMultiPageIndex(baseComponentId) ?? 0;
  const multiPageEnabled = useExternalItem(baseComponentId, 'RepeatingGroup').edit?.multiPage ?? false;
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
    setMultiPageIndex,
  };
}

export function RepeatingGroupEditRowProvider({ children }: PropsWithChildren) {
  const baseComponentId = useRepeatingGroupComponentId();
  const { setMultiPageIndex, ...state } = useRepeatingGroupEditRowState(baseComponentId);
  const layoutLookups = useLayoutLookups();

  useRegisterNavigationHandler(async (_targetIndexedId, targetBaseComponentId) => {
    if (!state.multiPageEnabled) {
      // Nothing to do here. Other navigation handlers will make sure this row is opened for editing.
      return false;
    }
    let isOurChildDirectly = false;
    let isOurChildRecursively = false;
    let subject: ParentRef = { type: 'node', id: targetBaseComponentId };
    while (subject?.type === 'node') {
      const parent = layoutLookups.componentToParent[subject.id];
      if (parent?.type === 'node' && parent.id === baseComponentId) {
        isOurChildRecursively = true;
        isOurChildDirectly = subject.id === targetBaseComponentId;
        break;
      }
      subject = parent;
    }

    if (!isOurChildRecursively) {
      return false;
    }

    const ourConfig = layoutLookups.getComponent(baseComponentId, 'RepeatingGroup');
    if (!ourConfig.edit?.multiPage) {
      return true;
    }

    // It's our child, but not directly. We need to figure out which of our children contains the target,
    // and navigate there. Then it's a problem that can be forwarded there.
    const multiPageSubject = isOurChildDirectly ? targetBaseComponentId : subject.id;

    for (const id of ourConfig.children) {
      const [pageIndex, baseId] = id.split(':', 2);
      if (baseId === multiPageSubject) {
        setMultiPageIndex(parseInt(pageIndex, 10));
        return true;
      }
    }

    return false;
  });

  return <Provider value={state}>{children}</Provider>;
}

export const useRepeatingGroupEdit = () => useCtx();
