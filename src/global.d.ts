import type { ToolkitStore } from '@reduxjs/toolkit/src/configureStore';

import type { IFeatureTogglesOptionalMap } from 'src/features/toggles';
import type { IRuleObject, IRules, IRuntimeState } from 'src/types';

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

    /** @deprecated */
    deprecated: {
      /**
       * Do not use this unless you know what you are doing. This is a temporary solution to get the current form data
       * in sagas until we have migrated to the new formData hook (where sagas should be removed). If you find yourself
       * wanting to use this, please consider if you can use FD.useAsDotMap() instead.
       *
       * Note that this value is not reactive either, so it only makes sense to call this in saga-like code that runs
       * once and is triggered by external actions.
       *
       * @deprecated
       * @see FD.useAsDotMap
       */
      currentFormData: IFormData;
    };
  }
}
