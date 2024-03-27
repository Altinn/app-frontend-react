import { useQuery } from '@tanstack/react-query';

import { useAppQueries } from 'src/core/contexts/AppQueriesProvider';

export const usePaymentInformationQuery = (partyId?: string, instanceGuid?: string) => {
  const { fetchPaymentInfo } = useAppQueries();
  return useQuery({
    queryKey: ['fetchPaymentInfo', partyId, instanceGuid],
    queryFn: () => {
      if (partyId && instanceGuid) {
        return fetchPaymentInfo(partyId, instanceGuid);
      }
    },
    enabled: !!partyId && !!instanceGuid,
  });
};
