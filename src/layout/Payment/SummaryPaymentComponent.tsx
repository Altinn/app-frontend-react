import React from 'react';

import { Alert, Paragraph } from '@digdir/designsystemet-react';

import { Caption } from 'src/components/form/Caption';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { getInstanceReferenceNumber } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import classes from 'src/layout/Payment/PaymentComponent.module.css';
import { PaymentStatus } from 'src/layout/Payment/queries/types';
import { usePaymentInformationQuery } from 'src/layout/Payment/queries/usePaymentInformationQuery';
import { PaymentDetailsTable } from 'src/layout/PaymentDetails/PaymentDetailsTable';
import type { ISummaryComponent } from 'src/layout/Summary/SummaryComponent';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

interface ISummaryPaymentComponentProps {
  changeText: string | null;
  onChangeClick: () => void;
  summaryNode: LayoutNode<'Summary'>;
  targetNode: LayoutNode<'Payment'>;
  overrides?: ISummaryComponent['overrides'];
}

export const SummaryPaymentComponent = ({ targetNode }: ISummaryPaymentComponentProps) => {
  const textResourceBindings = targetNode.item.textResourceBindings;
  const { partyId, instanceGuid } = useInstanceIdParams();
  const { data: paymentInfo } = usePaymentInformationQuery(partyId, instanceGuid);
  const instance = useLaxInstanceData();
  const privatePersonPayer = paymentInfo?.paymentDetails?.payer.privatePerson; //.company ?? paymentInfo?.paymentDetails?.payer.privatePerson;

  return (
    <>
      <div className={classes.infoDetailsContainer}>
        {paymentInfo?.paymentDetails?.paymentId && (
          <Paragraph
            size={'small'}
            spacing={false}
          >
            <Lang id={'payment.receipt.payment_id'} />: <b>{paymentInfo.paymentDetails.paymentId}</b>
          </Paragraph>
        )}

        {instance && (
          <Paragraph
            size={'small'}
            spacing={false}
          >
            <Lang id={'payment.receipt.altinn_ref'} />: <b>{getInstanceReferenceNumber(instance)}</b>
          </Paragraph>
        )}

        <Paragraph
          size={'small'}
          spacing={false}
        >
          <Lang id={'payment.receipt.payment_date'} />: <b>{new Date().getDate().toString()}</b>
        </Paragraph>

        <Paragraph
          size={'small'}
          spacing={false}
        >
          <Lang id={'payment.receipt.total_amount'} />: <b>{paymentInfo?.orderDetails.totalPriceIncVat}</b>
        </Paragraph>
      </div>

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

      <div
        className={classes.senderReceiverInfoContainer}
        style={{ display: 'flex', width: '100%', marginBottom: '' }}
      >
        <table style={{ width: '100%' }}>
          <Caption title={<Lang id={'payment.receipt.receiver'} />} />

          <tr>
            <th>
              <Lang id='payment.receipt.name' />
            </th>
            <td>{paymentInfo?.orderDetails?.receiver?.name}</td>
          </tr>
          <tr>
            <th>
              <Lang id='payment.receipt.phone' />
            </th>
            <td>{textResourceBindings?.receiptPhoneNumber} </td>
          </tr>
          <tr>
            <th>
              <Lang id='payment.receipt.address' />
            </th>
            <td>
              {textResourceBindings?.receiptStreetAdress} {textResourceBindings?.receiptCountry}{' '}
              {textResourceBindings?.receiptZipCode}{' '}
            </td>
          </tr>
          <tr>
            <th>
              <Lang id='payment.receipt.org_num' />
            </th>
            <td>
              <td>{paymentInfo?.orderDetails?.receiver?.organisationNumber}</td>
            </td>
          </tr>
          <tr>
            <th>
              <Lang id='payment.receipt.account_number' />
            </th>
            <td>{textResourceBindings?.receiptBankAcountNumber} </td>
          </tr>
          <tr>
            <th>
              <Lang id='payment.receipt.email' />
            </th>
            <td>{textResourceBindings?.receiptEmailAdress} </td>
          </tr>
        </table>

        {privatePersonPayer && (
          <table style={{ width: '100%' }}>
            <Caption title={<Lang id={'payment.receipt.payer'} />} />

            {privatePersonPayer.firstName && (
              <tr>
                <th>
                  <Lang id={'payment.receipt.name'}></Lang>
                </th>
                <td>{paymentInfo?.paymentDetails?.paymentId}</td>
              </tr>
            )}
            {privatePersonPayer.phoneNumber?.number && (
              <tr>
                <th>
                  <Lang id={'payment.receipt.phone'}></Lang>
                </th>
                <td>{privatePersonPayer.phoneNumber.number}</td>
              </tr>
            )}

            <tr>
              <th>
                <Lang id={'payment.receipt.email'}></Lang>
              </th>
              <td>{privatePersonPayer.email}</td>
            </tr>

            <tr>
              <th>
                <Lang id={'payment.receipt.card_number'}></Lang>
              </th>
              <td>{paymentInfo?.paymentDetails?.cardDetails?.maskedPan}</td>
            </tr>
            <tr>
              <th>
                <Lang id={'payment.receipt.card_expiry'}></Lang>
              </th>
              <td>{paymentInfo?.paymentDetails?.cardDetails?.expiryDate}</td>
            </tr>
          </table>
        )}
      </div>

      <PaymentDetailsTable
        orderDetails={paymentInfo?.orderDetails}
        tableTitle={textResourceBindings?.title}
        description={textResourceBindings?.description}
        className={classes.container}
      />
    </>
  );
};
