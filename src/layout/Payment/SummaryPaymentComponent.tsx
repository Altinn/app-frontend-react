import React from 'react';

import { Alert, Heading } from '@digdir/design-system-react';

import type { PropsFromGenericComponent } from '..';

import { Lang } from 'src/features/language/Lang';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import classes from 'src/layout/Payment/PaymentComponent.module.css';
import { PaymentStatus } from 'src/layout/Payment/queries/types';
import { usePaymentInformationQuery } from 'src/layout/Payment/queries/usePaymentInformationQuery';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';
import type { ISummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export type IPaymentProps = PropsFromGenericComponent<'Payment'>;

interface ISummaryPaymentComponentProps {
  changeText: string | null;
  onChangeClick: () => void;
  summaryNode: LayoutNode<'Summary'>;
  targetNode: LayoutNode<'Payment'>;
  overrides?: ISummaryComponent['overrides'];
}

export const SummaryPaymentComponent = ({ targetNode }: ISummaryPaymentComponentProps) => {
  const textResourceBindings = targetNode.item.textResourceBindings;

  // Render these values in the receipt PDF:
  // From API:
  //   - Payment ID
  //   - Payment date
  //   - Order date
  //   - Masked card number, last 4 digits when card was used
  //   - Order details / line items
  //     - Total amount
  //     - currency
  // From the instance:
  //   - Order number / reference id
  // From configuration:
  //   - contact details

  const { partyId, instanceGuid } = useInstanceIdParams();
  const { data: paymentInfo } = usePaymentInformationQuery(partyId, instanceGuid);

  return (
    <>
      <div className={classes.container}>
        {paymentInfo?.paymentDetails?.status === PaymentStatus.Failed && (
          <Alert severity='warning'>
            <Lang id='payment.alert.failed' />
          </Alert>
        )}
        {paymentInfo?.paymentDetails?.status === PaymentStatus.Paid && (
          <Alert severity={'success'}>
            <Lang id='payment.alert.paid' />
            <span>ID: {paymentInfo.paymentDetails.paymentId}</span>
          </Alert>
        )}
      </div>
      <PaymentDetailsTable
        orderDetails={paymentInfo?.orderDetails}
        tableTitle={
          <Heading
            level={2}
            size='medium'
          >
            <Lang id='payment.summary' />
          </Heading>
        }
        className={classes.container}
      />
      <div className={classes.receipDetailsContainer}>
        <Heading
          level={3}
          size='small'
        >
          Mottaker
        </Heading>
        <div className={classes.infoContainer}>
          <div className={classes.infoDetailsContainer}>
            <span>Navn:</span>
            <span>Telefon:</span>
            <span>Adresse:</span>
            <span>Organisasjonsnummer:</span>
            <span>Kontonumer:</span>
            <span>E-post:</span>
          </div>
          <div className={classes.infoDetailsContainer}>
            <span>{textResourceBindings?.receiptOrgName}</span>
            <span>{textResourceBindings?.receiptPhoneNumber}</span>
            <span>
              {textResourceBindings?.receiptStreetAdress} {textResourceBindings?.receiptCity}{' '}
              {textResourceBindings?.receiptCountry}
            </span>
            <span>{textResourceBindings?.receiptOrgNumber}</span>
            <span>{textResourceBindings?.receiptBankAcountNumber}</span>
            <span>{textResourceBindings?.receiptEmailAdress}</span>
          </div>
        </div>
      </div>
      <div>
        <Heading
          level={3}
          size='small'
        >
          Avsender
        </Heading>
        <div className={classes.infoContainer}>
          <div className={classes.infoDetailsContainer}>
            <span>Navn:</span>
            <span>Telefon:</span>
            <span>Adresse:</span>
            <span>Organisasjonsnummer:</span>
            <span>Kontonumer:</span>
            <span>E-post:</span>
          </div>
          <div className={classes.infoDetailsContainer}>
            <span>{textResourceBindings?.receiptOrgName}</span>
            <span>{textResourceBindings?.receiptPhoneNumber}</span>
            <span>
              {textResourceBindings?.receiptStreetAdress} {textResourceBindings?.receiptCity}{' '}
              {textResourceBindings?.receiptCountry}
            </span>
            <span>{textResourceBindings?.receiptOrgNumber}</span>
            <span>{textResourceBindings?.receiptBankAcountNumber}</span>
            <span>{textResourceBindings?.receiptEmailAdress}</span>
          </div>
        </div>
      </div>
    </>
  );
};
