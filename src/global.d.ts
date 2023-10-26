import type { ToolkitStore } from '@reduxjs/toolkit/src/configureStore';

import type { IAttachments } from 'src/features/attachments';
import type { IFeatureTogglesOptionalMap } from 'src/features/toggles';
import type { IRuleObject, IRules, IRuntimeState } from 'src/types';
import type { IInstance, IProcess } from 'src/types/shared';

declare global {
  interface Window {
    app: string;
    instanceId: string | undefined;
    org: string;
    reportee: string;
    evalExpression: () => any;
    reduxStore: ToolkitStore<IRuntimeState>;
    reduxActionLog: any[];
    featureToggles: IFeatureTogglesOptionalMap;

    conditionalRuleHandlerObject: IRuleObject;
    conditionalRuleHandlerHelper: IRules;
    ruleHandlerObject: IRuleObject;
    ruleHandlerHelper: IRules;

    /**
     * In React components, hierarchy generators, or other places that are run continuously, use window.logErrorOnce() instead
     * @see window.logErrorOnce
     */
    logError: (...args: any[]) => void;
    /**
     * In React components, hierarchy generators, or other places that are run continuously, use window.logWarnOnce() instead
     * @see window.logWarnOnce
     */
    logWarn: (...args: any[]) => void;
    /**
     * In React components, hierarchy generators, or other places that are run continuously, use window.logInfoOnce() instead
     * @see window.logInfoOnce
     */
    logInfo: (...args: any[]) => void;
    logErrorOnce: (...args: any[]) => void;
    logWarnOnce: (...args: any[]) => void;
    logInfoOnce: (...args: any[]) => void;

    /**
     * Last known global states, sometimes used by Cypress tests, or otherwise in use while
     * rewriting away from Redux Saga
     */
    lastKnownInstance?: IInstance;
    lastKnownProcess?: IProcess;
    lastKnownAttachments?: IAttachments;
  }
}
