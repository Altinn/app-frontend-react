import React, { useCallback, useEffect, useId } from 'react';
import type { PropsWithChildren } from 'react';

import { createContext } from 'src/core/contexts/context';
import { useAsRef } from 'src/hooks/useAsRef';
import { GeneratorDebug, generatorLog } from 'src/utils/layout/generator/debug';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';

export const StageAddNodes = Symbol('AddNodes');
export const StageMarkHidden = Symbol('MarkHidden');
export const StageFormValidation = Symbol('FormValidation');
export const StageEvaluateExpressions = Symbol('EvaluateExpressions');
export const StageFetchOptions = Symbol('OptionsFetched');
export const StageFinished = Symbol('Finished');

const List = [
  StageAddNodes,
  StageMarkHidden,
  StageFormValidation,
  StageFetchOptions,
  StageEvaluateExpressions,
  StageFinished,
] as const;
const SecondToLast = List[List.length - 2];

type StageList = typeof List;
type Stage = StageList[number];

type OnStageDone = () => void;
interface Context {
  currentStage: Stage;
  registry: React.MutableRefObject<Registry>;
  tick: () => void;
}

const { Provider, useCtx } = createContext<Context>({
  name: 'GeneratorStages',
  required: true,
});

type Registry = {
  [stage in Stage]: {
    finished: boolean;
    onDone: OnStageDone[];
    components: {
      [id: string]: {
        finished: boolean;
      };
    };
    hooks: {
      [id: string]: {
        finished: boolean;
      };
    };
  };
};

function registryStats(stage: Stage, registry: Registry) {
  const numHooks = Object.keys(registry[stage].hooks).length;
  const doneHooks = Object.values(registry[stage].hooks).filter((h) => h.finished).length;
  const numComponents = Object.keys(registry[stage].components).length;
  const doneComponents = Object.values(registry[stage].components).filter((c) => c.finished).length;

  return { numHooks, doneHooks, numComponents, doneComponents };
}

function isStageDone(stage: Stage, registry: Registry) {
  const { numHooks, doneHooks, numComponents, doneComponents } = registryStats(stage, registry);
  return numHooks === doneHooks && numComponents === doneComponents;
}

/**
 * Generator stages provide useEffect() hooks that are called at different stages of the node generation process. This
 * is useful for separating logic into different stages that rely on earlier stages being completed before the
 * stage can begin. When processing the node hierarchy, it is important that all nodes are added to the storage before
 * we can start evaluating expressions, because expressions can reference other nodes.
 *
 * Wrapping hooks this way ensures that the order of execution of the hooks is guaranteed.
 */
export function GeneratorStagesProvider({ children }: PropsWithChildren) {
  if (window.performance.getEntriesByName(`GeneratorStages:${List[0].description}:start`).length === 0) {
    window.performance.mark(`GeneratorStages:${List[0].description}:start`);
  }

  const [currentStage, setCurrentStage] = React.useState<Stage>(List[0]);
  const currentStageRef = useAsRef(currentStage);
  const tickTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const registry = React.useRef<Registry>(
    Object.fromEntries(
      List.map((s) => [
        s as Stage,
        {
          finished: false,
          onDone: [],
          hooks: {},
          components: {},
        } satisfies Registry[Stage],
      ]),
    ) as Registry,
  );

  const tickFunc = useCallback(() => {
    setCurrentStage((stage) => {
      if (!isStageDone(stage, registry.current)) {
        return stage;
      }
      const currentIndex = List.indexOf(stage);
      const nextStage = List[currentIndex + 1];
      if (nextStage) {
        registry.current[stage].onDone.forEach((cb) => cb());
        registry.current[stage].onDone = [];
        registry.current[stage].finished = true;

        window.performance.mark(`GeneratorStages:${stage.description}:end`);
        window.performance.mark(`GeneratorStages:${nextStage.description}:start`);
        const duration = window.performance.measure(
          `GeneratorStages:${stage.description}`,
          `GeneratorStages:${stage.description}:start`,
          `GeneratorStages:${stage.description}:end`,
        );

        const hooks = Object.keys(registry.current[stage].hooks).length;
        const components = Object.keys(registry.current[stage].components).length;
        generatorLog(
          'logStages',
          `Stage finished: ${stage.description}, proceeding to ${nextStage.description}`,
          `(hooks: ${hooks}, conditional components: ${components}, duration: ${duration.duration.toFixed(2)}ms)`,
        );

        return nextStage;
      }
      return stage;
    });
  }, []);

  const tick = React.useCallback(() => {
    if (tickTimeout.current) {
      clearTimeout(tickTimeout.current);
    }
    tickTimeout.current = setTimeout(tickFunc, 100);
  }, [tickFunc]);

  useEffect(() => {
    if (GeneratorDebug.logStages) {
      let lastReportedStage: Stage | undefined;
      const interval = setInterval(() => {
        const current = currentStageRef.current;
        const last = List[List.length - 1];
        if (current === last) {
          clearInterval(interval);
        }
        if (lastReportedStage !== current) {
          return;
        }

        const { numHooks, doneHooks, numComponents, doneComponents } = registryStats(current, registry.current);
        generatorLog(
          'logStages',
          `Still on stage ${current.description}`,
          `(${doneHooks}/${numHooks} hooks finished, ${doneComponents}/${numComponents} conditional components finished)`,
        );

        // If we're stuck on the same stage for a while, log a list of hooks that are still pending
        const pendingHooks = Object.entries(registry.current[current].hooks)
          .filter(([, hook]) => !hook.finished)
          .map(([id]) => id)
          .join('\n - ');
        generatorLog('logStages', `Pending hooks:\n - ${pendingHooks}`);

        const pendingComponents = Object.entries(registry.current[current].components)
          .filter(([, component]) => !component.finished)
          .map(([id]) => id)
          .join('\n - ');
        generatorLog('logStages', `Pending components:\n - ${pendingComponents}`);

        lastReportedStage = current;
      }, 2500);
    }
  }, [currentStageRef]);

  return <Provider value={{ currentStage, registry, tick }}>{children}</Provider>;
}

/**
 * Utility collection for hooks you can use to attach to different stages. The hooks will only run when the generator
 * has reached the stage they are attached to (or, if the node generator has finished, they will run immediately).
 */
export const GeneratorStages = {
  AddNodes: makeHooks(StageAddNodes),
  MarkHidden: makeHooks(StageMarkHidden),
  FormValidation: makeHooks(StageFormValidation),
  FetchOptions: makeHooks(StageFetchOptions),
  EvaluateExpressions: makeHooks(StageEvaluateExpressions),
  Finished: makeHooks(StageFinished),
  useIsFinished() {
    return GeneratorStages[SecondToLast.description!].useIsDone();
  },
};

interface ConditionProps {
  stage: Stage;
  mustBeAdded?: 'parent' | 'all';
}

/**
 * A component you can wrap around your own components to make sure they only run when the generator has reached a
 * certain stage, and optionally only if a certain condition is met.
 */
export function GeneratorCondition({ stage, mustBeAdded, children }: PropsWithChildren<ConditionProps>) {
  const id = useUniqueId();
  const { currentStage, registry } = useCtx();
  if (!registry.current[stage].components[id]) {
    registry.current[stage].components[id] = { finished: false };
  }

  const currentIndex = List.indexOf(currentStage);
  const targetIndex = List.indexOf(stage);
  const shouldRender = currentIndex >= targetIndex;

  if (!shouldRender) {
    return null;
  }

  const props: WhenProps = { id, stage };

  if (mustBeAdded === 'parent') {
    return <WhenParentAdded {...props}>{children}</WhenParentAdded>;
  }

  if (mustBeAdded === 'all') {
    return <WhenAllAdded {...props}>{children}</WhenAllAdded>;
  }

  if (mustBeAdded === undefined) {
    return <Now {...props}>{children}</Now>;
  }

  throw new Error(`Invalid mustBeAdded value: ${mustBeAdded}`);
}

interface WhenProps extends PropsWithChildren {
  id: string;
  stage: Stage;
}

function WhenParentAdded({ id, stage, children }: WhenProps) {
  const parent = GeneratorInternal.useParent();
  const ready = NodesInternal.useIsAdded(parent);
  useMarkFinished(id, stage, ready);

  return ready ? <>{children}</> : null;
}

function WhenAllAdded({ id, stage, children }: WhenProps) {
  const parent = GeneratorInternal.useParent();
  const allAdded = GeneratorStages.AddNodes.useIsDone();
  const parentAdded = NodesInternal.useIsAdded(parent);
  const ready = allAdded && parentAdded;
  useMarkFinished(id, stage, ready);

  return ready ? <>{children}</> : null;
}

function Now({ id, stage, children }: WhenProps) {
  useMarkFinished(id, stage, true);
  return <>{children}</>;
}

function useMarkFinished(id: string, stage: Stage, ready: boolean) {
  const { registry } = useCtx();
  useEffect(() => {
    if (ready) {
      registry.current[stage].components[id].finished = true;
    }
  }, [id, registry, stage, ready]);
}

function useUniqueId() {
  return useId();
}

function makeHooks(stage: Stage) {
  function useEffect(effect: (markFinished: () => void) => void | (() => void), deps?: React.DependencyList) {
    const uniqueId = useUniqueId();

    const { currentStage, registry, tick } = useCtx();
    const runInStageIndex = List.indexOf(stage);
    const currentIndex = List.indexOf(currentStage);
    const shouldRun = currentIndex >= runInStageIndex;

    const reg = registry.current[stage];
    if (reg.finished && !registry.current[SecondToLast].finished && !reg.hooks[uniqueId]) {
      throw new Error(
        `Cannot register a new hook ${uniqueId} for stage ${stage.description} before having reached ` +
          `the Finished stage. This will happen if the node generator components are generated after ` +
          `GeneratorStages have advanced to a later stage.`,
      );
    }

    // Register and unregister the hook
    React.useEffect(() => {
      if (shouldRun) {
        const reg = registry.current[stage];
        reg.hooks[uniqueId] = reg.hooks[uniqueId] || { finished: false };
        return () => {
          if (reg.hooks[uniqueId].finished) {
            delete reg.hooks[uniqueId];
          }
        };
      }
    }, [uniqueId, registry, shouldRun, tick]);

    // Run the actual hook
    React.useEffect(() => {
      if (shouldRun) {
        const markFinished = () => {
          registry.current[stage].hooks[uniqueId].finished = true;
        };
        const returnValue = effect(markFinished);
        tick();
        return returnValue;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldRun, ...(deps || [])]);
  }

  return {
    useConditionalEffect(effect: () => boolean, deps?: React.DependencyList) {
      useEffect((markFinished) => {
        if (effect()) {
          markFinished();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, deps);
    },
    useEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
      useEffect((markFinished) => {
        const out = effect();
        markFinished();
        return out;
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, deps);
    },
    useOnDone(cb: OnStageDone) {
      const isAddedRef = React.useRef(false);
      const { registry, currentStage } = useCtx();
      if (currentStage === stage && !isAddedRef.current) {
        registry.current[stage].onDone.push(cb);
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
