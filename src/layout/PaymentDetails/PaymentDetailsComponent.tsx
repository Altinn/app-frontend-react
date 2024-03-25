import React from 'react';

import { useQuery } from '@tanstack/react-query';

import { FD } from 'src/features/formData/FormDataWrite';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';
import { fetchOrderDetails } from 'src/queries/queries';
import type { PropsFromGenericComponent } from 'src/layout';

export type IPaymentDetailsProps = PropsFromGenericComponent<'PaymentDetails'>;

export function PaymentDetailsComponent({ node }: IPaymentDetailsProps) {
  const { partyId, instanceGuid } = useInstanceIdParams();
  const { title, description } = node.item.textResourceBindings || {};
  /*   const updateOrderDetailsWhenChanged = node.item?.updateOrderDetailsWhenChanged;

  const testNode = useResolvedNode<IPaymentDetailsProps>(node.item.id);
  const updateWhenChanged = testNode?.item.updateOrderDetailsWhenChanged;

  console.log('updateOrderDetailsWhenChanged', updateWhenChanged); */

  const mappedValues = FD.useMapping(node.item.mapping);

  const test = JSON.stringify(mappedValues);
  console.log('mappedValues', test);

  const { data: useOrderDetailsQuery } = useQuery({
    queryKey: ['fetchOrderDetails', partyId, instanceGuid, test],
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
      title={title}
      description={description}
    />
  );
}
