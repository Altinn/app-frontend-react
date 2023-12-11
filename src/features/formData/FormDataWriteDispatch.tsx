import { createContext } from 'src/core/contexts/context';
import type { FDAction } from 'src/features/formData/FormDataWriteStateMachine';

type Gatekeeper = (action: FDAction) => boolean;

/**
 * You can provide your own gatekeeper if you want to decide which actions internal to the FormDataWriter state
 * machine should be allowed to be dispatched.
 */
const { Provider, useCtx } = createContext<Gatekeeper>({
  name: 'FormDataWriteDispatchGatekeeper',
  required: false,
  default: () => true,
});

export const FormDataWriteDispatchGatekeeperProvider = Provider;
export const useFormDataWriteDispatchGatekeeper = () => useCtx();
