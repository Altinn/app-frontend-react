import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';
import { fetchOrderDetails } from 'src/queries/queries';
import type { PropsFromGenericComponent } from 'src/layout';

export type IPaymentDetailsProps = PropsFromGenericComponent<'PaymentDetails'>;

export function PaymentDetailsComponent({ node }: IPaymentDetailsProps) {
  const { partyId, instanceGuid } = useInstanceIdParams();

  const useOrderDetailsQuery = useQuery({
    queryKey: ['fetchOrderDetails', partyId, instanceGuid],
    queryFn: () => {
      if (partyId) {
        return fetchOrderDetails(partyId, instanceGuid);
      }
    },
  });

  return <PaymentDetailsTable orderDetails={useOrderDetailsQuery.data} />;
}
