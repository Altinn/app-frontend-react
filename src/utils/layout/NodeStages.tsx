import React from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';

export const StageAddNodes = Symbol('AddNodes');
export const StageMarkHidden = Symbol('MarkHidden');
export const StageEvaluateExpressions = Symbol('EvaluateExpressions');
export const StageFinished = Symbol('Finished');

export const NodeStageList = [StageAddNodes, StageMarkHidden, StageEvaluateExpressions, StageFinished] as const;

export type NodeStages = typeof NodeStageList;
type Stage = NodeStages[number];

type OnStageDone = () => void;
interface Context {
  currentStage: Stage;
  numHooksRegistered: React.MutableRefObject<number>;
  numHooksFinished: React.MutableRefObject<number>;
  onStageDone: React.MutableRefObject<OnStageDone[]>;
  tick: () => void;
}

const { Provider, useCtx } = createContext<Context>({
  name: 'NodeStages',
  required: true,
});

/**
 * Node stages provide useEffect() hooks that are called at different stages of the node generation process. This is
 * useful for separating logic into different stages that rely on earlier stages being completed before the next stage
 * can begin. When processing the node hierarchy, it is important that all nodes are added to the storage before
 * we can start evaluating expressions, because expressions can reference other nodes.
 *
 * Wrapping hooks this way ensures that the order of execution of the hooks is guaranteed.
 */
export function NodeStagesProvider({ children }: PropsWithChildren) {
  const [currentStage, setCurrentStage] = React.useState<Stage>(NodeStageList[0]);
  const tickTimeout = React.useRef<number | null>(null);
  const numHooksRegistered = React.useRef(0);
  const numHooksFinished = React.useRef(0);
  const onStageDone = React.useRef<OnStageDone[]>([]);

  function tick() {
    if (tickTimeout.current) {
      clearTimeout(tickTimeout.current);
    }
    setTimeout(() => {
      if (numHooksRegistered.current === numHooksFinished.current) {
        onStageDone.current.forEach((cb) => cb());
        onStageDone.current = [];

        const currentIndex = NodeStageList.indexOf(currentStage);
        const nextStage = NodeStageList[currentIndex + 1];
        if (nextStage) {
          console.log('debug, Advancing to next stage:', nextStage, 'as', numHooksRegistered.current, 'hooks are done');
          setCurrentStage(nextStage);
        }
      }
    }, 10);
  }

  return (
    <Provider value={{ currentStage, numHooksRegistered, numHooksFinished, onStageDone, tick }}>{children}</Provider>
  );
}

export const NodeStages = {
  S1AddNodes: makeHooks(StageAddNodes),
  S2MarkHidden: makeHooks(StageMarkHidden),
  S3EvaluateExpressions: makeHooks(StageEvaluateExpressions),
  S4Finished: makeHooks(StageFinished),
  useIsFinished() {
    return NodeStages.S3EvaluateExpressions.useIsDone();
  },
};

function makeHooks(stage: Stage) {
  return {
    useEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
      const { currentStage, numHooksRegistered, numHooksFinished, tick } = useCtx();
      const runInStageIndex = NodeStageList.indexOf(stage);
      const currentIndex = NodeStageList.indexOf(currentStage);
      const shouldRun = currentIndex >= runInStageIndex;

      const thisHookRanBefore = React.useRef<boolean>(false);
      if (!thisHookRanBefore.current && shouldRun) {
        numHooksRegistered.current++;
        thisHookRanBefore.current = true;
        console.log('debug, Registered hook for stage:', stage);
      }

      const incrementBy = React.useRef(1);

      React.useEffect(() => {
        if (shouldRun) {
          const returnValue = effect();
          numHooksFinished.current += incrementBy.current;
          incrementBy.current = 0;
          tick();
          return returnValue;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [shouldRun, ...(deps || [])]);
    },
    useOnDone(cb: OnStageDone) {
      const isAddedRef = React.useRef(false);
      const { onStageDone, currentStage } = useCtx();
      if (currentStage === stage && !isAddedRef.current) {
        onStageDone.current.push(cb);
        isAddedRef.current = true;
      }
    },
    useIsDone() {
      const { currentStage } = useCtx();
      const currentIndex = NodeStageList.indexOf(currentStage);
      const targetStageIndex = NodeStageList.indexOf(stage);
      return currentIndex > targetStageIndex;
    },
  };
}
