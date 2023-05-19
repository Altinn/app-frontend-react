import { createContext, useContext } from 'react';

export type NodeInspectorContextValue =
  | {
      selectedNodeId: string | undefined;
      selectNode: (id: string) => void;
    }
  | undefined;

const NodeInspectorContext = createContext<NodeInspectorContextValue>(undefined);

export const useNodeInspectorContext = () => {
  const context = useContext(NodeInspectorContext);
  if (!context) {
    throw new Error('useNodeInspectorContext must be used within a NodeInspectorContextProvider');
  }
  return context;
};

export const NodeInspectorContextProvider = NodeInspectorContext.Provider;
