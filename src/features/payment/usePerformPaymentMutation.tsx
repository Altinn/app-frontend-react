import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';

export const usePerformPayActionMutation = (partyId?: string, instanceGuid?: string) => {
  const { doPerformAction } = useAppMutations();
  return useMutation({
    mutationKey: ['performPayAction', partyId, instanceGuid],
    mutationFn: async () => {
      if (partyId && instanceGuid) {
        return await doPerformAction(partyId, instanceGuid, { action: 'pay' });
      }
    },
    onError: (error: AxiosError) => {
      console.error('Error performing pay action', error);
      if (error.response?.status === 409) {
        window.location.reload();
      }
    },
    onSuccess: (data) => {
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    },
  });
};
