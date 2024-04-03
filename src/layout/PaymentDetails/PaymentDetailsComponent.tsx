import React, { useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { FD } from 'src/features/formData/FormDataWrite';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';
import { fetchOrderDetails } from 'src/queries/queries';
import type { PropsFromGenericComponent } from 'src/layout';

export type IPaymentDetailsProps = PropsFromGenericComponent<'PaymentDetails'>;

export function PaymentDetailsComponent({ node }: IPaymentDetailsProps) {
  const { partyId, instanceGuid } = useInstanceIdParams();
  const { title, description } = node.item.textResourceBindings || {};
  const hasUnsavedChanges = FD.useHasUnsavedChanges();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!hasUnsavedChanges) {
      queryClient.invalidateQueries({ queryKey: ['fetchOrderDetails'] });
    }
  }, [hasUnsavedChanges, queryClient]);

  const { data: useOrderDetailsQuery } = useQuery({
    queryKey: ['fetchOrderDetails'],
    queryFn: () => {
      if (partyId) {
        return fetchOrderDetails(partyId, instanceGuid);
      }
    },
    enabled: !!partyId && !!instanceGuid,
  });

  return (
    <PaymentDetailsTable
      orderDetails={useOrderDetailsQuery}
      tableTitle={title}
      description={description}
    />
  );
}
