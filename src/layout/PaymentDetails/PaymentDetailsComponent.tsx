import React, { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { FD } from 'src/features/formData/FormDataWrite';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';
import { useOrderDetailsQuery } from 'src/layout/PaymentDetails/useOrderDetailsQuery';
import type { PropsFromGenericComponent } from 'src/layout';

export type IPaymentDetailsProps = PropsFromGenericComponent<'PaymentDetails'>;

export function PaymentDetailsComponent({ node }: IPaymentDetailsProps) {
  const { partyId, instanceGuid } = useInstanceIdParams();
  const { title, description } = node.item.textResourceBindings || {};
  const hasUnsavedChanges = FD.useHasUnsavedChanges();
  const queryClient = useQueryClient();
  const { data: orderDetails } = useOrderDetailsQuery(partyId, instanceGuid);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      queryClient.invalidateQueries({ queryKey: ['fetchOrderDetails'] });
    }
  }, [hasUnsavedChanges, queryClient]);

  return (
    <PaymentDetailsTable
      orderDetails={orderDetails}
      tableTitle={title}
      description={description}
    />
  );
}