import { useCallback, useEffect } from 'react';

import { useAsRef } from 'src/hooks/useAsRef';
import { generatorLog } from 'src/utils/layout/generator/debug';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { GeneratorData } from 'src/utils/layout/generator/GeneratorDataSources';
import { NODES_TICK_TIMEOUT, StageFinished } from 'src/utils/layout/generator/GeneratorStages';
import {
  type AddNodeRequest,
  NodesInternal,
  NodesStore,
  type RemoveNodeRequest,
  type SetNodePropRequest,
  type SetPagePropRequest,
} from 'src/utils/layout/NodesContext';

/**
 * Queues for changes that need to be committed to the nodes store.
 */
export interface RegistryCommitQueues {
  addNodes: AddNodeRequest[];
  removeNodes: RemoveNodeRequest[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setNodeProps: SetNodePropRequest<any, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPageProps: SetPagePropRequest<any>[];
}

export function useGetAwaitingCommits() {
  const registry = GeneratorInternal.useRegistry();

  return useCallback(() => {
    const toCommit = registry.current.toCommit;
    return (
      toCommit.addNodes.length +
      toCommit.removeNodes.length +
      toCommit.setNodeProps.length +
      toCommit.setPageProps.length
    );
  }, [registry]);
}

export function useCommit() {
  const addNodes = NodesInternal.useAddNodes();
  const removeNodes = NodesInternal.useRemoveNodes();
  const setNodeProps = NodesInternal.useSetNodeProps();
  const setPageProps = NodesInternal.useSetPageProps();
  const registry = GeneratorInternal.useRegistry();

  return useCallback(() => {
    const toCommit = registry.current.toCommit;
    let changes = false;

    if (toCommit.addNodes.length) {
      generatorLog('logCommits', 'Committing', toCommit.addNodes.length, 'addNodes requests');
      addNodes(toCommit.addNodes);
      toCommit.addNodes.length = 0; // This truncates the array, but keeps the reference
      changes = true;
    }

    if (toCommit.removeNodes.length) {
      generatorLog('logCommits', 'Committing', toCommit.removeNodes.length, 'removeNodes requests');
      removeNodes(toCommit.removeNodes);
      toCommit.removeNodes.length = 0;
      changes = true;
    }

    if (toCommit.setNodeProps.length) {
      generatorLog('logCommits', 'Committing', toCommit.setNodeProps.length, 'setNodeProps requests:', () => {
        const counts = {};
        for (const { prop } of toCommit.setNodeProps) {
          counts[prop] = (counts[prop] || 0) + 1;
        }
        return Object.entries(counts)
          .map(([prop, count]) => `${count}x ${prop}`)
          .join(', ');
      });
      setNodeProps(toCommit.setNodeProps);
      toCommit.setNodeProps.length = 0;
      changes = true;
    }

    if (toCommit.setPageProps.length) {
      generatorLog('logCommits', 'Committing', toCommit.setPageProps.length, 'setPageProps requests');
      setPageProps(toCommit.setPageProps);
      toCommit.setPageProps.length = 0;
      changes = true;
    }

    updateCommitsPendingInBody(toCommit);
    return changes;
  }, [addNodes, removeNodes, setNodeProps, setPageProps, registry]);
}

export function SetWaitForCommits() {
  const setWaitForCommits = NodesInternal.useSetWaitForCommits();
  const registry = GeneratorInternal.useRegistry();

  const waitForCommits = useCallback(async () => {
    const toCommit = registry.current.toCommit;
    let didWait = false;
    while (Object.values(toCommit).some((arr) => arr.length > 0)) {
      await new Promise((resolve) => setTimeout(resolve, 4));
      didWait = true;
    }

    // If we did wait, wait some more (until the commits have been stored)
    if (didWait) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }, [registry]);

  useEffect(() => {
    setWaitForCommits(waitForCommits);
  }, [setWaitForCommits, waitForCommits]);

  return null;
}

/**
 * When we're adding nodes, we could be calling setState() on each of the states we need to update, but this would
 * be very costly and scale badly with larger forms (layout sets). Instead, we collect all the changes we need to make
 * and then apply them all at once. The principle only works if we're calling these queue functions in useEffect
 * hooks from a stage, because we'll check to make sure all hooks registered in a render cycle have finished before
 * committing all the changes in one go.
 */
export const NodesStateQueue = {
  useAddNode: (req: AddNodeRequest, condition = true) => useAddToQueue('addNodes', false, req, condition),
  useRemoveNode: (req: Omit<RemoveNodeRequest, 'layouts'>) => useOnUnmount(req),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useSetNodeProp: (req: SetNodePropRequest<any, any>, condition: boolean) =>
    useAddToQueue('setNodeProps', true, req, condition),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useSetPageProp: (req: SetPagePropRequest<any>, condition: boolean) =>
    useAddToQueue('setPageProps', true, req, condition),
};

function useAddToQueue<T extends keyof RegistryCommitQueues>(
  queue: T,
  commitAfter: boolean,
  request: RegistryCommitQueues[T][number],
  condition: boolean,
) {
  const registry = GeneratorInternal.useRegistry();
  const toCommit = registry.current.toCommit;
  const commit = GeneratorData.useCommitWhenFinished();

  if (condition) {
    registry.current.toCommitCount += 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toCommit[queue].push(request as any);
    updateCommitsPendingInBody(toCommit);
    if (commitAfter) {
      commit();
    }
  }
}

function useOnUnmount(request: Omit<RemoveNodeRequest, 'layouts'>) {
  // This state is intentionally not reactive, as we want to commit _what the layout was when this node was created_,
  // so that we don't accidentally remove a node with the same ID from a future/different layout.
  const layoutsWas = NodesStore.useStaticSelector((s) => s.layouts!);

  const registry = GeneratorInternal.useRegistry();
  const toCommit = registry.current.toCommit;
  const ref = useAsRef(request);
  const commit = GeneratorData.useCommitWhenFinished();

  useEffect(() => {
    const reg = registry.current;
    const request = ref.current;

    return () => {
      reg.toCommitCount += 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toCommit['removeNodes'].push({ ...request, layouts: layoutsWas } as any);
      updateCommitsPendingInBody(toCommit);
      commit();
    };
  }, [commit, ref, registry, toCommit, layoutsWas]);
}

/**
 * Some of the queue hooks need to commit changes even when all stages are in a finished state. Even though we're not
 * in a generation cycle, we still need to commit changes like expressions updating, validations, etc. To speed this
 * up (setTimeout is slow, at least when debugging), we'll set a timeout once if this selector find out the generator
 * has finished.
 */
export function useCommitWhenFinished() {
  const commit = useCommit();
  const registry = GeneratorInternal.useRegistry();
  const stateRef = NodesStore.useSelectorAsRef((s) => s.stages);

  return useCallback(() => {
    if (stateRef.current.currentStage === StageFinished && !registry.current.commitTimeout) {
      registry.current.commitTimeout = setTimeout(() => {
        commit();
        registry.current.commitTimeout = null;
      }, 4);
    }
  }, [stateRef, commit, registry]);
}

function updateCommitsPendingInBody(toCommit: RegistryCommitQueues) {
  const anyPendingCommits = Object.values(toCommit).some((arr) => arr.length > 0);
  if (anyPendingCommits) {
    document.body.setAttribute('data-commits-pending', 'true');
  } else {
    setTimeout(() => {
      document.body.setAttribute('data-commits-pending', 'false');
    }, NODES_TICK_TIMEOUT + 1);
  }
}
