import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/contexts/appQueriesContext';

export interface Prefill {
  [key: string]: any;
}

export interface InstanceOwner {
  partyId: string | undefined;
}

export interface Instantiation {
  instanceOwner: InstanceOwner;
  prefill: Prefill;
}

export function useInstantiateWithPrefillMutation() {
  const { doInstantiateWithPrefill } = useAppMutations();
  return useMutation({
    mutationFn: (instantiation: Instantiation) => doInstantiateWithPrefill.call(instantiation),
    onSuccess: (data) => {
      doInstantiateWithPrefill.setLastResult(data);
    },
    onError: (error) => {
      console.warn(error);
      throw new Error('Server did not fulfill instantiation with prefill');
    },
  });
}
