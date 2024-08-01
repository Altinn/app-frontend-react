export type DevToolsHiddenComponents = 'show' | 'disabled' | 'hide';

export type IDevToolsState = {
  isOpen: boolean;
  pdfPreview: boolean;
  hiddenComponents: DevToolsHiddenComponents;
  activeTab: DevToolsTab;
  activeSelectionMode: SelectionMode | undefined;
  layoutInspector: {
    selectedComponentId: string | undefined;
  };
  nodeInspector: {
    selectedNodeId: string | undefined;
  };
  dataModelInspector: {
    selectedDataModelBinding: string | undefined;
    selectedPath: string | undefined;
  };
  exprPlayground: {
    expression: string | undefined;
    forPage: string | undefined;
    forComponentId: string | undefined;
  };
  logs: IDevToolsLog[];
};

export type IDevToolsActions = {
  open: () => void;
  close: () => void;
  setActiveTab: (tabName: DevToolsTab) => void;
  setActiveSelectionMode: (mode: SelectionMode | undefined) => void;
  focusLayoutInspector: (componentId: string) => void;
  focusNodeInspector: (nodeId: string) => void;
  focusDataModelInspector: (dataModelBinding: string) => void;
  setPdfPreview: (preview: boolean) => void;
  setShowHiddenComponents: (value: DevToolsHiddenComponents) => void;
  exprPlaygroundSetExpression: (expression: string | undefined) => void;
  exprPlaygroundSetContext: (forPage: string | undefined, forComponentId: string | undefined) => void;
  layoutInspectorSet: (selectedComponentId: string | undefined) => void;
  nodeInspectorSet: (selectedNodeId: string | undefined) => void;
  dataModelInspectorSet: (selectedPath: string | undefined) => void;
  postLogs: (logs: IDevToolsLog[]) => void;
  logsClear: () => void;
};

export type IDevToolsLog = {
  index: number;
  level: 'info' | 'warn' | 'error';
  message: string;
};

export enum DevToolsTab {
  General = 'Generelt',
  Layout = 'Layout',
  Components = 'Komponenter',
  Expressions = 'Uttrykk',
  DataModel = 'Datamodell',
  FeatureToggles = 'Beta-funksjonalitet',
  Logs = 'Logger',
}

export type SelectionMode = 'component' | 'node' | 'dataModel';
