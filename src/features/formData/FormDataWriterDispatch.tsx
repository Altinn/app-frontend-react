import { createContext } from 'src/core/contexts/context';
import type { FDActionExceptInitialFetch } from 'src/features/formData/StateMachine';

type Gatekeeper = (action: FDActionExceptInitialFetch) => boolean;

/**
 * You can provide your own gatekeeper if you want to decide which actions internal to the FormDataWriter state
 * machine should be allowed to be dispatched.
 */
const { Provider, useCtx } = createContext<Gatekeeper>({
  name: 'FormDataDispatchGatekeeper',
  required: false,
  default: () => true,
});

export const FormDataDispatchGatekeeperProvider = Provider;
export const useFormDataDispatchGatekeeper = () => useCtx();
