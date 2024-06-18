import React, { useCallback, useEffect, useId, useRef } from 'react';
import type { MutableRefObject, PropsWithChildren } from 'react';

import { createStore } from 'zustand';

import { createZustandContext } from 'src/core/contexts/zustandContext';
import { GeneratorDebug, generatorLog } from 'src/utils/layout/generator/debug';
import { GeneratorInternal } from 'src/utils/layout/generator/GeneratorContext';
import { NodesInternal } from 'src/utils/layout/NodesContext';
import type { AddNodeRequest, SetNodePropRequest } from 'src/utils/layout/NodesContext';
import type { SetRowExtrasRequest } from 'src/utils/layout/plugins/RepeatingChildrenStorePlugin';

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
  tick: undefined | (() => void);
  setTick: (tick: () => void) => void;
  nextStage: () => void;
  runNum: number;
  restart: (reason: 'hook' | 'component') => void;
  toCommit: {
    addNodes: AddNodeRequest[];
    setNodeProps: SetNodePropRequest<any, any>[];
    setRowExtras: SetRowExtrasRequest[];
  };
}

interface CreateStoreProps {
  registry: MutableRefObject<Registry>;
}

function performanceMark(action: 'start' | 'end', runNum: number, stage?: Stage) {
  const _stage = stage ? stage.description : 'total';
  window.performance.mark(`GeneratorStages:${_stage}:${action}:${runNum}`);
}

function formatDuration(runNum: number, stage?: Stage) {
  const _stage = stage ? stage.description : 'total';
  const start = window.performance.getEntriesByName(`GeneratorStages:${_stage}:start:${runNum}`)[0];
  const end = window.performance.getEntriesByName(`GeneratorStages:${_stage}:end:${runNum}`)[0];
  if (!start || !end) {
    return '';
  }
  return `${(end.startTime - start.startTime).toFixed(0)}ms`;
}

const { Provider, useSelector, useSelectorAsRef, useMemoSelector, useHasProvider } = createZustandContext({
  name: 'GeneratorStages',
  required: true,
  initialCreateStore: ({ registry }: CreateStoreProps) => {
    generatorLog('logStages', `Initial node generation started`);
    performanceMark('start', 1, List[0]);
    performanceMark('start', 1);

    return createStore<Context>((set) => ({
      currentStage: List[0],
      registry,
      tick: undefined,
      setTick: (tick) => {
        set({ tick });
      },
      nextStage: () => {
        set((state) => {
          const currentIndex = List.indexOf(state.currentStage);
          const nextStage = List[currentIndex + 1];
          if (nextStage) {
            performanceMark('end', state.runNum, state.currentStage);
            performanceMark('start', state.runNum, nextStage);

            const hooks = Object.values(registry.current[state.currentStage].hooks).filter(
              (hook) => hook.initialRunNum === state.runNum && hook.finished,
            ).length;
            const components = Object.values(registry.current[state.currentStage].components).filter(
              (component) => component.initialRunNum === state.runNum && component.finished,
            ).length;

            generatorLog(
              'logStages',
              `Stage finished: ${state.currentStage.description}`,
              `(hooks: ${hooks},`,
              `conditionals: ${components},`,
              `duration ${formatDuration(state.runNum, state.currentStage)})`,
            );

            if (nextStage === StageFinished) {
              performanceMark('end', state.runNum);
              generatorLog('logStages', `Node generation finished, total duration`, formatDuration(state.runNum));
            }
            return { currentStage: nextStage };
          }
          return state;
        });
      },
      runNum: 1,
      restart: (reason) => {
        set((state) => {
          if (state.currentStage === List[List.length - 1]) {
            const runNum = state.runNum + 1;
            generatorLog('logStages', `New`, reason, `registered, restarting stages (run ${runNum})`);
            performanceMark('start', runNum, List[0]);
            performanceMark('start', runNum);

            for (const stage of List) {
              registry.current[stage].finished = false;
            }

            return { currentStage: List[0], runNum };
          }

          return {};
        });
      },
      toCommit: {
        // These should be considered as 'refs'. Meaning, we won't set them via an action, we'll always just manipulate
        // the arrays references directly.
        addNodes: [],
        setNodeProps: [],
        setRowExtras: [],
      },
    }));
  },
});

type Registry = {
  [stage in Stage]: {
    finished: boolean;
    onDone: OnStageDone[];
    components: {
      [id: string]: {
        initialRunNum: number;
        finished: boolean;
      };
    };
    hooks: {
      [id: string]: {
        initialRunNum: number;
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

function shouldCommit(stage: Stage, registry: Registry) {
  const { numHooks, doneHooks } = registryStats(stage, registry);
  return numHooks === doneHooks;
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

  return (
    <Provider registry={registry}>
      <SetTickFunc />
      {GeneratorDebug.logStages && <LogSlowStages />}
      <WhenTickIsSet>{children}</WhenTickIsSet>
    </Provider>
  );
}

function useCommit() {
  const addNodes = NodesInternal.useAddNodes();
  const setNodeProps = NodesInternal.useSetNodeProps();
  const setRowExtras = NodesInternal.useSetRowExtras();
  const toCommit = useSelector((state) => state.toCommit);

  return useCallback(() => {
    if (toCommit.addNodes.length) {
      generatorLog('logCommits', 'Committing', toCommit.addNodes.length, 'addNodes requests');
      addNodes(toCommit.addNodes);
      toCommit.addNodes.length = 0; // This truncates the array, but keeps the reference
      return true;
    }

    let changes = false;
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

    if (toCommit.setRowExtras.length) {
      generatorLog('logCommits', 'Committing', toCommit.setRowExtras.length, 'setRowExtras requests');
      setRowExtras(toCommit.setRowExtras);
      toCommit.setRowExtras.length = 0;
      changes = true;
    }

    return changes;
  }, [addNodes, setNodeProps, setRowExtras, toCommit]);
}

/**
 * When we're adding nodes, we could be calling setState() on each of the states we need to update, but this would
 * be very costly and scale badly with larger forms (layout sets). Instead, we collect all the changes we need to make
 * and then apply them all at once. The principle only works if we're calling these queue functions in useEffect
 * hooks from a stage, because we'll check to make sure all hooks registered in a render cycle have finished before
 * committing all the changes in one go.
 */
export const NodesStateQueue = {
  useAddNode() {
    const addNodeRequestsRef = useSelector((state) => state.toCommit.addNodes);

    return useCallback(
      (request: AddNodeRequest) => {
        addNodeRequestsRef.push(request);
      },
      [addNodeRequestsRef],
    );
  },
  useSetNodeProp() {
    const setNodePropRequestsRef = useSelector((state) => state.toCommit.setNodeProps);
    useCommitWhenFinished();

    return useCallback(
      (request: SetNodePropRequest<any, any>) => {
        setNodePropRequestsRef.push(request);
      },
      [setNodePropRequestsRef],
    );
  },
  useSetRowExtras() {
    const setRowExtrasRequestsRef = useSelector((state) => state.toCommit.setRowExtras);
    useCommitWhenFinished();

    return useCallback(
      (request: SetRowExtrasRequest) => {
        setRowExtrasRequestsRef.push(request);
      },
      [setRowExtrasRequestsRef],
    );
  },
};

/**
 * Some of the queue hooks need to commit changes even when all stages are in a finished state. Even though we're not
 * in a generation cycle, we still need to commit changes like expressions updating, validations, etc. To speed this
 * up (setTimeout is slow, at least when debugging), we'll set a timeout once if this selector find out the generator
 * has finished.
 */
let commitTimeout: NodeJS.Timeout | null = null;
function useCommitWhenFinished() {
  const commit = useCommit();
  useSelector((state) => {
    if (state.currentStage === StageFinished && !commitTimeout) {
      commitTimeout = setTimeout(() => {
        commit();
        commitTimeout = null;
      }, 4);
    }
  });
}

function SetTickFunc() {
  const currentStageRef = useSelectorAsRef((state) => state.currentStage);
  const goToNextStage = useSelector((state) => state.nextStage);
  const setTick = useSelector((state) => state.setTick);
  const registry = useSelector((state) => state.registry);
  const commit = useCommit();

  const tickTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const tickFunc = useCallback(() => {
    tickTimeout.current = null;

    const stage = currentStageRef.current;
    if (!isStageDone(stage, registry.current)) {
      if (shouldCommit(stage, registry.current)) {
        commit();
      }
      return;
    }
    const currentIndex = List.indexOf(stage);
    const nextStage = List[currentIndex + 1];
    if (!nextStage) {
      return;
    }

    if (commit()) {
      setTimeout(tickFunc, 4);
      return;
    }

    registry.current[stage].onDone.forEach((cb) => cb());
    registry.current[stage].onDone = [];
    registry.current[stage].finished = true;

    goToNextStage();
  }, [currentStageRef, registry, goToNextStage, commit]);

  const tick = React.useCallback(() => {
    if (!tickTimeout.current) {
      tickTimeout.current = setTimeout(tickFunc, 4);
    }
  }, [tickFunc]);

  useEffect(() => {
    setTick(tick);
    return () => {
      if (tickTimeout.current) {
        clearTimeout(tickTimeout.current);
      }
    };
  }, [setTick, tick]);

  return null;
}

function LogSlowStages() {
  const currentStageRef = useSelectorAsRef((state) => state.currentStage);
  const registry = useSelector((state) => state.registry);
  useEffect(() => {
    let lastReportedStage: Stage | undefined;
    const interval = setInterval(() => {
      const current = currentStageRef.current;
      const last = List[List.length - 1];
      if (current === last) {
        clearInterval(interval);
        return;
      }
      if (lastReportedStage !== current) {
        lastReportedStage = current;
        return;
      }
      lastReportedStage = current;

      const { numHooks, doneHooks, numComponents, doneComponents } = registryStats(current, registry.current);
      generatorLog(
        'logStages',
        `Still on stage ${current.description}`,
        `(${doneHooks}/${numHooks} hooks finished, ${doneComponents}/${numComponents} conditionals finished)`,
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
    }, 2500);
  }, [currentStageRef, registry]);

  return null;
}

function WhenTickIsSet({ children }: PropsWithChildren) {
  const tick = useSelector((state) => state.tick);
  if (!tick) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Utility collection for hooks you can use to attach to different stages. The hooks will only run when the generator
 * has reached the stage they are attached to (or, if the node generator has finished, they will run immediately).
 */
const Finished = makeHooks(StageFinished);
export const GeneratorStages = {
  AddNodes: makeHooks(StageAddNodes),
  MarkHidden: makeHooks(StageMarkHidden),
  FormValidation: makeHooks(StageFormValidation),
  FetchOptions: makeHooks(StageFetchOptions),
  EvaluateExpressions: makeHooks(StageEvaluateExpressions),
  useIsFinished() {
    return Finished.useIsCurrent();
  },
  useIsGenerating() {
    return useHasProvider();
  },
};

/**
 * This is purposefully not reactive, i.e. when the generator run count increases, this stays the same as when the
 * hook/component was first rendered. This is to make sure that conditionals in existing nodes are not affected
 * by new nodes being added (because existing nodes should be treated as if the generator stages have already
 * finished).
 */
function useInitialRunNum() {
  const runNumberRef = useSelectorAsRef((state) => state.runNum);

  const ref = useRef(runNumberRef.current);
  return ref.current;
}

function useShouldRenderOrRun(stage: Stage, isNew: boolean, restartReason: 'hook' | 'component') {
  const initialRun = useInitialRunNum();

  const [shouldRenderOrRun, shouldRestart] = useMemoSelector((state) => {
    if (isNew && state.currentStage === StageFinished) {
      return [false, true];
    }
    if (!isNew && state.runNum > initialRun) {
      return [true, false];
    }

    return [isStageAtLeast(state, stage), false];
  });

  // When new hooks and components are registered and the stages have finished (typically when a new
  // row in a repeating group is added, and thus new nodes are being generated), restart the stages.
  const restart = useSelector((state) => state.restart);
  useEffect(() => {
    if (shouldRestart) {
      restart(restartReason);
    }
  }, [restart, restartReason, shouldRestart]);

  return shouldRenderOrRun;
}

function isStageAtLeast(state: Context, stage: Stage) {
  const currentIndex = List.indexOf(state.currentStage);
  const targetIndex = List.indexOf(stage);
  return currentIndex >= targetIndex;
}

function useIsStageAtLeast(stage: Stage) {
  return useSelector((state) => isStageAtLeast(state, stage));
}

function useIsStageAtLeastRef(stage: Stage) {
  return useSelectorAsRef((state) => isStageAtLeast(state, stage));
}

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
  const registry = useSelector((state) => state.registry);
  const initialRunNum = useInitialRunNum();

  let isNew = false;
  if (!registry.current[stage].components[id]) {
    registry.current[stage].components[id] = { finished: false, initialRunNum };
    isNew = true;
  }

  const shouldRender = useShouldRenderOrRun(stage, isNew, 'component');
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
  const registry = useSelector((state) => state.registry);
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
    const registry = useSelector((state) => state.registry);
    const tick = useSelector((state) => state.tick!);
    const initialRunNum = useInitialRunNum();

    let isNew = false;
    const reg = registry.current[stage];
    if (!reg.hooks[uniqueId]) {
      reg.hooks[uniqueId] = { finished: false, initialRunNum };
      isNew = true;
    }

    if (reg.finished && !registry.current[SecondToLast].finished && isNew) {
      throw new Error(
        `Cannot register a new hook ${uniqueId} for stage ${stage.description} before having reached ` +
          `the Finished stage. This will happen if the node generator components are generated after ` +
          `GeneratorStages have advanced to a later stage.`,
      );
    }

    const shouldRun = useShouldRenderOrRun(stage, isNew, 'hook');

    // Unregister the hook when it is removed
    React.useEffect(() => {
      if (shouldRun) {
        const reg = registry.current[stage];
        return () => {
          if (reg.hooks[uniqueId].finished) {
            delete reg.hooks[uniqueId];
          }
        };
      }
    }, [uniqueId, registry, shouldRun]);

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
      const registry = useSelector((state) => state.registry);
      const isDoneRef = useIsStageAtLeastRef(stage);
      const isAddedRef = React.useRef(false);
      if (!isDoneRef.current && !isAddedRef.current) {
        registry.current[stage].onDone.push(cb);
        isAddedRef.current = true;
      } else if (isDoneRef.current) {
        throw new Error(`Cannot add onDone callback to stage ${stage.description} after it has already finished`);
      }
    },
    useIsDone() {
      return useIsStageAtLeast(stage);
    },
    useIsCurrent() {
      return useMemoSelector((state) => state.currentStage === stage);
    },
  };
}
