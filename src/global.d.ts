import type { ToolkitStore } from '@reduxjs/toolkit/src/configureStore';

import type { IFormData } from 'src/features/formData';
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

    conditionalRuleHandlerObject: IRuleObject;
    conditionalRuleHandlerHelper: IRules;
    ruleHandlerObject: IRuleObject;
    ruleHandlerHelper: IRules;

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
