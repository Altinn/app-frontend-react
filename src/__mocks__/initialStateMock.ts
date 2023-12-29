import { getFormLayoutStateMock } from 'src/__mocks__/getFormLayoutStateMock';
import { DevToolsTab } from 'src/features/devtools/data/types';
import type { IRuntimeState } from 'src/types';

export function getInitialStateMock(custom?: Partial<IRuntimeState> | ((state: IRuntimeState) => void)): IRuntimeState {
  const initialState: IRuntimeState = {
    devTools: {
      activeTab: DevToolsTab.General,
      isOpen: false,
      pdfPreview: false,
      hiddenComponents: 'hide',
      layoutInspector: {
        selectedComponentId: undefined,
      },
      nodeInspector: {
        selectedNodeId: undefined,
      },
      exprPlayground: {
        expression: undefined,
        forPage: undefined,
        forComponentId: undefined,
      },
      logs: [],
    },
    formLayout: getFormLayoutStateMock(),
  };

  if (custom && typeof custom === 'function') {
    custom(initialState);
    return initialState;
  }

  return {
    ...initialState,
    ...custom,
  };
}
