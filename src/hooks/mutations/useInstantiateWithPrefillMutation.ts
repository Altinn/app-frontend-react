import { useMutation } from '@tanstack/react-query';

import { useAppMutations } from 'src/contexts/appQueriesContext';
import type { Instantiation } from 'src/services/InstancesApi';

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
