import type { ToolkitStore } from '@reduxjs/toolkit/src/configureStore';

import type { IRules, IRuntimeState } from 'src/types';

declare global {
  interface Window {
    app: string;
    conditionalRuleHandlerHelper: IRules;
    instanceId: string;
    org: string;
    reportee: string;
    evalExpression: () => any;
    reduxStore: ToolkitStore<IRuntimeState>;
    reduxActionLog: any[];
  }
}
