import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import { PaymentStatus } from 'src/layout/Payment/queries/types';

export const usePaymentInformationQuery = (partyId?: string, instanceGuid?: string) => {
  const { fetchPaymentInformation } = useAppQueries();
  const { next } = useProcessNavigation() || {};
  return useQuery({
    queryKey: ['fetchPaymentInfo', partyId, instanceGuid],
    queryFn: async () => {
      if (partyId && instanceGuid) {
        const result = await fetchPaymentInformation(partyId, instanceGuid);
        if (result?.status === PaymentStatus.Paid) {
          next && next({ action: 'confirm', nodeId: 'next-button' });
        }
        return result;
      }
    },
    enabled: !!partyId && !!instanceGuid,
  });
};
