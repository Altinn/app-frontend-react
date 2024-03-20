import React from 'react';

import { Alert, Button, Heading, Label, Table } from '@digdir/design-system-react';
import { useQuery } from '@tanstack/react-query';

import { useAppMutations } from 'src/core/contexts/AppQueriesProvider';
import { useProcessNavigation } from 'src/features/instance/ProcessNavigationContext';
import classes from 'src/features/payment/Payment.module.css';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { fetchPaymentInfo } from 'src/queries/queries';
export const Payment: React.FunctionComponent = () => {
  const { partyId, instanceGuid } = useInstanceIdParams();
  const { doPerformAction } = useAppMutations();
  const { next, busyWithId: processNextBusyId } = useProcessNavigation() || {};

  const paymentInfoQuery = useQuery({
    queryKey: ['fetchPaymentInfo', partyId, instanceGuid],
    queryFn: () => {
      if (partyId) {
        return fetchPaymentInfo(partyId, instanceGuid);
      }
    },
    enabled: !!partyId && !!instanceGuid,
  });

  return (
    <div className={classes.paymentContainer}>
      <Table className={classes.orderDetailsTable}>
        <caption className={classes.tableCaption}>
          <Heading level={2}>Summary</Heading>
        </caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.HeaderCell>Quantity</Table.HeaderCell>
            <Table.HeaderCell>Price</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {paymentInfoQuery.data?.orderDetails.orderLines.map((orderLine, index) => (
            <Table.Row key={index}>
              <Table.Cell>{orderLine.name}</Table.Cell>
              <Table.Cell>{orderLine.quantity}</Table.Cell>
              <Table.Cell>{orderLine.priceExVat + orderLine.priceExVat * (orderLine.vatPercent / 100)}</Table.Cell>
            </Table.Row>
          ))}
          <Table.Row>
            <Table.Cell colSpan={2}>
              <Label>Total</Label>
            </Table.Cell>
            <Table.Cell>{paymentInfoQuery.data?.orderDetails.totalPriceIncVat}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      {paymentInfoQuery.isFetched && paymentInfoQuery.data?.status === 'Failed' && (
        <Alert severity='warning'>Your payment has failed</Alert>
      )}
      {paymentInfoQuery.isFetched && paymentInfoQuery.data?.status === 'Paid' && (
        <Alert severity={'info'}>You have paid!</Alert>
      )}
      {paymentInfoQuery.isFetched && paymentInfoQuery.data?.status !== 'Paid' && partyId && (
        <div>
          <Button
            className={classes.payButton}
            variant='secondary'
            onClick={() => next && next({ action: 'reject', nodeId: 'reject-button' })}
          >
            Back
          </Button>
          <Button
            className={classes.payButton}
            color='success'
            onClick={() => doPerformAction(partyId, instanceGuid, { action: 'pay', buttonId: 'pay-button' })}
          >
            Pay!
          </Button>

          <a href={paymentInfoQuery.data?.redirectUrl}>test</a>
        </div>
      )}
      {paymentInfoQuery.isFetched && paymentInfoQuery.data?.status === 'Paid' && (
        <Button
          className={classes.payButton}
          variant='secondary'
          onClick={() => next && next({ nodeId: 'next-button' })}
        >
          Next
        </Button>
      )}
    </div>
  );
};
