import React from 'react';

import { Heading, Label, Table } from '@digdir/design-system-react';

import classes from 'src/layout/PaymentDetails/PaymentDetailsTable.module.css';
import type { OrderDetails } from 'src/features/payment/types';

type PaymentDetailsTableProps = {
  orderDetails?: OrderDetails;
};

export const PaymentDetailsTable = (props: PaymentDetailsTableProps) => (
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
      {props.orderDetails?.orderLines.map((orderLine, index) => (
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
        <Table.Cell>{props.orderDetails?.totalPriceIncVat}</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);
