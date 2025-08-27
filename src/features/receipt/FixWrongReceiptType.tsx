import React, { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { Loader } from 'src/core/loading/Loader';
import { useLayoutSets } from 'src/features/form/layoutSets/LayoutSetsProvider';
import { useNavigationParam } from 'src/hooks/navigation';
import { TaskKeys, useNavigateToTask } from 'src/hooks/useNavigatePage';
import { behavesLikeDataTask } from 'src/utils/formLayout';

/**
 * Wrap this around any components rendered in a receipt route. This will check if you were actually supposed to
 * go to a different route (either the built-in receipt or the custom receipt), and will redirect you there if
 * you're in the wrong place
 */
export function FixWrongReceiptType({ children }: PropsWithChildren) {
  const taskId = useNavigationParam('taskId');
  const layoutSets = useLayoutSets();
  const hasCustomReceipt = behavesLikeDataTask(TaskKeys.CustomReceipt, layoutSets);
  const navigateToTask = useNavigateToTask();

  let redirectTo: undefined | TaskKeys = undefined;
  if (taskId === TaskKeys.ProcessEnd && hasCustomReceipt) {
    redirectTo = TaskKeys.CustomReceipt;
  } else if (taskId === TaskKeys.CustomReceipt && !hasCustomReceipt) {
    redirectTo = TaskKeys.ProcessEnd;
  }

  useEffect(() => {
    if (redirectTo) {
      navigateToTask(redirectTo, { replace: true });
    }
  }, [navigateToTask, redirectTo]);

  if (redirectTo) {
    return <Loader reason='fix-wrong-receipt-type' />;
  }

  return children;
}
