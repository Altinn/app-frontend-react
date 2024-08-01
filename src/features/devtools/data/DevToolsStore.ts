import { createStore, useStore } from 'zustand';

import { DevToolsTab } from 'src/features/devtools/data/types';
import type {
  DevToolsHiddenComponents,
  IDevToolsActions,
  IDevToolsLog,
  IDevToolsState,
} from 'src/features/devtools/data/types';

type Store = IDevToolsState & { actions: IDevToolsActions };

export const DevToolsStore = createStore<Store>((set) => ({
  isOpen: false,
  pdfPreview: false,
  hiddenComponents: 'hide',
  activeTab: DevToolsTab.General,
  activeSelectionMode: undefined,
  layoutInspector: {
    selectedComponentId: undefined,
  },
  nodeInspector: {
    selectedNodeId: undefined,
  },
  dataModelInspector: {
    selectedDataModelBinding: undefined,
    selectedPath: undefined,
  },
  exprPlayground: {
    expression: undefined,
    forPage: undefined,
    forComponentId: undefined,
  },
  logs: [],
  actions: {
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    setActiveTab: (tabName: DevToolsTab) =>
      set({
        activeTab: tabName,
        layoutInspector: { selectedComponentId: undefined },
        nodeInspector: { selectedNodeId: undefined },
      }),
    setActiveSelectionMode: (mode) => set({ activeSelectionMode: mode }),
    focusLayoutInspector: (componentId: string) =>
      set({ activeTab: DevToolsTab.Layout, layoutInspector: { selectedComponentId: componentId } }),
    focusNodeInspector: (nodeId: string) =>
      set({ activeTab: DevToolsTab.Components, nodeInspector: { selectedNodeId: nodeId } }),
    focusDataModelInspector: (dataModelBinding: string) =>
      set({
        activeTab: DevToolsTab.DataModel,
        dataModelInspector: { selectedPath: undefined, selectedDataModelBinding: dataModelBinding },
      }),
    setPdfPreview: (preview: boolean) => set({ pdfPreview: preview }),
    setShowHiddenComponents: (value: DevToolsHiddenComponents) => set({ hiddenComponents: value }),
    exprPlaygroundSetExpression: (expression: string | undefined) =>
      set((state) => ({ exprPlayground: { ...state.exprPlayground, expression } })),
    exprPlaygroundSetContext: (forPage: string | undefined, forComponentId: string | undefined) =>
      set((state) => ({ exprPlayground: { ...state.exprPlayground, forPage, forComponentId } })),
    layoutInspectorSet: (selectedComponentId: string | undefined) => set({ layoutInspector: { selectedComponentId } }),
    nodeInspectorSet: (selectedNodeId: string | undefined) => set({ nodeInspector: { selectedNodeId } }),
    dataModelInspectorSet: (selectedPath: string | undefined) =>
      set({ dataModelInspector: { selectedDataModelBinding: undefined, selectedPath } }),
    postLogs: (newLogs: IDevToolsLog[]) => set(({ logs }) => ({ logs: [...logs, ...newLogs] })),
    logsClear: () => set({ logs: [] }),
  },
}));

export const useDevToolsStore = <T>(selector: (state: Store) => T) => useStore(DevToolsStore, selector);
