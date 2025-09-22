import React, { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

interface TaskOverridesContext {
  taskId?: string;
  dataModelType?: string;
  dataElementId?: string;
  layoutSetId?: string;
  depth: number;
}

const Context = createContext<TaskOverridesContext>({ depth: 1 });

type Props = PropsWithChildren & Omit<TaskOverridesContext, 'depth'>;
export function TaskOverrides({ children, ...overrides }: Props) {
  const parentContext = useContext(Context);

  return (
    <Context.Provider
      value={{
        taskId: overrides.taskId ?? parentContext.taskId,
        dataModelType: overrides.dataModelType ?? parentContext.dataModelType,
        dataElementId: overrides.dataElementId ?? parentContext.dataElementId,
        layoutSetId: overrides.layoutSetId ?? parentContext.layoutSetId,
        depth: parentContext.depth + 1,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useTaskOverrides = () => useContext(Context);
