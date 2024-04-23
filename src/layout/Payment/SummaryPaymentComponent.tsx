import React from 'react';

import { Alert, Paragraph } from '@digdir/designsystemet-react';

import type { PropsFromGenericComponent } from '..';

import { Caption } from 'src/components/form/Caption';
import { useLaxInstanceData } from 'src/features/instance/InstanceContext';
import { Lang } from 'src/features/language/Lang';
import { useInstanceIdParams } from 'src/hooks/useInstanceIdParams';
import { getInstanceReferenceNumber } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import classes from 'src/layout/Payment/PaymentComponent.module.css';
import { usePaymentInformationQuery } from 'src/layout/Payment/queries/usePaymentInformationQuery';
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
  console.log(targetNode.item.textResourceBindings);
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
  const instance = useLaxInstanceData();

  // const payer = paymentInfo?.paymentDetails?.payer.company ? paymentInfo?.paymentDetails?.payer.company : paymentInfo?.paymentDetails?.payer.privatePerson

  // const payer = paymentInfo?.paymentDetails?.payer.company ?? paymentInfo?.paymentDetails?.payer.privatePerson;

  const privatePersonPayer = paymentInfo?.paymentDetails?.payer.privatePerson; //.company ?? paymentInfo?.paymentDetails?.payer.privatePerson;
  const organisationPayer = paymentInfo?.paymentDetails?.payer.company;

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
        {paymentInfo?.paymentDetails?.status === 'Failed' && (
          <Alert severity='warning'>
            <Lang id='payment.alert.failed' />
          </Alert>
        )}
        {paymentInfo?.paymentDetails?.status === 'Paid' && (
          <Alert severity={'success'}>
            <Lang id='payment.alert.paid' />
            <span>ID: {paymentInfo.paymentDetails.paymentId}</span>
          </Alert>
        )}
      </div>
      {/*<PaymentDetailsTable*/}
      {/*  orderDetails={paymentInfo?.orderDetails}*/}
      {/*  tableTitle={*/}
      {/*    <Heading*/}
      {/*      level={2}*/}
      {/*      size='medium'*/}
      {/*    >*/}
      {/*      <Lang id='payment.summary' />*/}
      {/*    </Heading>*/}
      {/*  }*/}
      {/*  className={classes.container}*/}
      {/*/>*/}

      <div style={{ display: 'flex', width: '100%' }}>
        <table style={{ flex: 1 }}>
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
          <table style={{ flex: 1 }}>
            <Caption title={<Lang id={'payment.receipt.payer'} />} />

            {privatePersonPayer.firstName && (
              <tr>
                <th>Navn</th>
                <td>{paymentInfo?.paymentDetails?.paymentId}</td>
              </tr>
            )}
            {privatePersonPayer.phoneNumber?.number && (
              <tr>
                <th>Telefon</th>
                <td>{privatePersonPayer.phoneNumber.number}</td>
              </tr>
            )}

            <tr>
              <th>E-post</th>
              <td>{privatePersonPayer.email}</td>
            </tr>
          </table>
        )}
      </div>

      {/*<div className={classes.receipDetailsContainer}>*/}
      {/*  <Heading*/}
      {/*    level={3}*/}
      {/*    size='small'*/}
      {/*  >*/}
      {/*    Mottaker*/}
      {/*  </Heading>*/}

      {/*  <Table></Table>*/}

      {/*  <div className={classes.infoContainer}>*/}
      {/*    <div className={classes.infoDetailsContainer}>*/}
      {/*      <span>Navn:</span>*/}
      {/*      <span>Telefon:</span>*/}
      {/*      <span>Adresse:</span>*/}
      {/*      <span>Organisasjonsnummer:</span>*/}
      {/*      <span>Kontonumer:</span>*/}
      {/*      <span>E-post:</span>*/}
      {/*    </div>*/}
      {/*    <div className={classes.infoDetailsContainer}>*/}
      {/*      <span>{textResourceBindings?.receiptOrgName}</span>*/}
      {/*      <span>{textResourceBindings?.receiptPhoneNumber}</span>*/}
      {/*      <span>*/}
      {/*        {textResourceBindings?.receiptStreetAdress} {textResourceBindings?.receiptCity}{' '}*/}
      {/*        {textResourceBindings?.receiptCountry}*/}
      {/*      </span>*/}
      {/*      <span>{textResourceBindings?.receiptOrgNumber}</span>*/}
      {/*      <span>{textResourceBindings?.receiptBankAcountNumber}</span>*/}
      {/*      <span>{textResourceBindings?.receiptEmailAdress}</span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      {/*<div>*/}
      {/*  <Heading*/}
      {/*    level={3}*/}
      {/*    size='small'*/}
      {/*  >*/}
      {/*    Avsender*/}
      {/*  </Heading>*/}
      {/*  <div className={classes.infoContainer}>*/}
      {/*    <div className={classes.infoDetailsContainer}>*/}
      {/*      <span>Navn:</span>*/}
      {/*      <span>Telefon:</span>*/}
      {/*      <span>Adresse:</span>*/}
      {/*      <span>Organisasjonsnummer:</span>*/}
      {/*      <span>Kontonumer:</span>*/}
      {/*      <span>E-post:</span>*/}
      {/*    </div>*/}
      {/*    <div className={classes.infoDetailsContainer}>*/}
      {/*      <span>{textResourceBindings?.receiptOrgName}</span>*/}
      {/*      <span>{textResourceBindings?.receiptPhoneNumber}</span>*/}
      {/*      <span>*/}
      {/*        {textResourceBindings?.receiptStreetAdress} {textResourceBindings?.receiptCity}{' '}*/}
      {/*        {textResourceBindings?.receiptCountry}*/}
      {/*      </span>*/}
      {/*      <span>{textResourceBindings?.receiptOrgNumber}</span>*/}
      {/*      <span>{textResourceBindings?.receiptBankAcountNumber}</span>*/}
      {/*      <span>{textResourceBindings?.receiptEmailAdress}</span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </>
  );
};
