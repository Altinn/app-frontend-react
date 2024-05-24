import React, { useId } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';

export const StageAddNodes = Symbol('AddNodes');
export const StageMarkHidden = Symbol('MarkHidden');
export const StageEvaluateExpressions = Symbol('EvaluateExpressions');
export const StageOptionsFetched = Symbol('OptionsFetched');
export const StageFinished = Symbol('Finished');

const List = [StageAddNodes, StageMarkHidden, StageEvaluateExpressions, StageOptionsFetched, StageFinished] as const;
const SecondToLast = List[List.length - 2];

type StageList = typeof List;
type Stage = StageList[number];

type OnStageDone = () => void;
interface Context {
  currentStage: Stage;
  hooks: React.MutableRefObject<HookRegistry>;
  tick: () => void;
}

const { Provider, useCtx } = createContext<Context>({
  name: 'GeneratorStages',
  required: true,
});

type HookRegistry = {
  [stage in Stage]: {
    finished: boolean;
    onDone: OnStageDone[];
    hooks: {
      [id: string]: {
        finished: boolean;
      };
    };
  };
};

/**
 * Generator stages provide useEffect() hooks that are called at different stages of the node generation process. This
 * is useful for separating logic into different stages that rely on earlier stages being completed before the
 * stage can begin. When processing the node hierarchy, it is important that all nodes are added to the storage before
 * we can start evaluating expressions, because expressions can reference other nodes.
 *
 * Wrapping hooks this way ensures that the order of execution of the hooks is guaranteed.
 */
export function GeneratorStagesProvider({ children }: PropsWithChildren) {
  const [currentStage, setCurrentStage] = React.useState<Stage>(List[0]);
  const tickTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const hooks = React.useRef<HookRegistry>(
    Object.fromEntries(
      List.map(
        (s) =>
          [
            s as Stage,
            {
              finished: false,
              onDone: [],
              hooks: {},
            },
          ] as const,
      ),
    ) as HookRegistry,
  );

  const tick = React.useCallback(() => {
    if (tickTimeout.current) {
      clearTimeout(tickTimeout.current);
    }
    tickTimeout.current = setTimeout(() => {
      setCurrentStage((stage) => {
        const registered = Object.keys(hooks.current[stage].hooks).length;
        const finished = Object.values(hooks.current[stage].hooks).filter((h) => h.finished).length;
        if (registered !== finished || registered === 0) {
          return stage;
        }
        const currentIndex = List.indexOf(stage);
        const nextStage = List[currentIndex + 1];
        if (nextStage) {
          hooks.current[stage].onDone.forEach((cb) => cb());
          hooks.current[stage].onDone = [];
          hooks.current[stage].finished = true;
          return nextStage;
        }
        return stage;
      });
    }, 100);
  }, []);

  return <Provider value={{ currentStage, hooks, tick }}>{children}</Provider>;
}

export const GeneratorStages = {
  AddNodes: makeHooks(StageAddNodes),
  MarkHidden: makeHooks(StageMarkHidden),
  EvaluateExpressions: makeHooks(StageEvaluateExpressions),
  OptionsFetched: makeHooks(StageOptionsFetched),
  Finished: makeHooks(StageFinished),
  useIsFinished() {
    return GeneratorStages[SecondToLast.description!].useIsDone();
  },
};

function makeHooks(stage: Stage) {
  return {
    useEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
      const uniqueId = useId();

      const { currentStage, hooks, tick } = useCtx();
      const runInStageIndex = List.indexOf(stage);
      const currentIndex = List.indexOf(currentStage);
      const shouldRun = currentIndex >= runInStageIndex;

      tick();
      const registry = hooks.current[stage];
      if (registry.finished && !hooks.current[SecondToLast].finished && !registry.hooks[uniqueId]) {
        throw new Error(
          `Cannot register a new hook ${uniqueId} for stage ${stage.description} before having reached ` +
            `the Finished stage. This will happen if the node generator components are generated after ` +
            `GeneratorStages have advanced to a later stage.`,
        );
      }

      // Register and unregister the hook
      React.useEffect(() => {
        if (shouldRun) {
          const registry = hooks.current[stage];
          registry.hooks[uniqueId] = registry.hooks[uniqueId] || { finished: false };
          tick();
          return () => {
            if (registry.hooks[uniqueId].finished) {
              delete registry.hooks[uniqueId];
            }
          };
        }
      }, [uniqueId, hooks, shouldRun, tick]);

      // Run the actual hook
      React.useEffect(() => {
        if (shouldRun) {
          const returnValue = effect();
          const registry = hooks.current[stage];
          registry.hooks[uniqueId].finished = true;
          tick();
          return returnValue;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [shouldRun, ...(deps || [])]);
    },
    useOnDone(cb: OnStageDone) {
      const isAddedRef = React.useRef(false);
      const { hooks, currentStage } = useCtx();
      if (currentStage === stage && !isAddedRef.current) {
        hooks.current[stage].onDone.push(cb);
        isAddedRef.current = true;
      }
    },
    useIsDone() {
      const { currentStage } = useCtx();
      const currentIndex = List.indexOf(currentStage);
      const targetStageIndex = List.indexOf(stage);
      return currentIndex > targetStageIndex;
    },
  };
}
