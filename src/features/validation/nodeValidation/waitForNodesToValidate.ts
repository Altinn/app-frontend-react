import { useCallback } from 'react';

import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { NodesStore } from 'src/utils/layout/NodesContext';
import type { ValidationsProcessedLast } from 'src/features/validation';

export function useWaitForNodesToValidate() {
  const registry = GeneratorInternal.useRegistry();
  const nodesStore = NodesStore.useStore();

  return useCallback(
    async (processedLast: ValidationsProcessedLast): Promise<void> => {
      let callbackId: ReturnType<typeof requestIdleCallback | typeof requestAnimationFrame> | undefined;
      const request = window.requestIdleCallback || window.requestAnimationFrame;
      const cancel = window.cancelIdleCallback || window.cancelAnimationFrame;

      function check(): boolean {
        const nodeIds = Object.keys(nodesStore.getState().nodeData);
        for (const nodeId of nodeIds) {
          const lastValidations = registry.current.validationsProcessed[nodeId];
          if (
            !(
              lastValidations &&
              lastValidations.initial === processedLast.initial &&
              lastValidations.incremental === processedLast.incremental
            )
          ) {
            return false;
          }
        }

        return true;
      }

      return new Promise<void>((resolve) => {
        function checkAndResolve() {
          if (check()) {
            resolve();
            callbackId && cancel(callbackId);
          } else {
            callbackId = request(checkAndResolve);
          }
        }

        checkAndResolve();
      });
    },
    [nodesStore, registry],
  );
}
