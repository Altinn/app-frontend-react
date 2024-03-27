import React from 'react';

import { Label, Table } from '@digdir/design-system-react';
import cn from 'classnames';

import { Caption } from 'src/components/form/Caption';
import classes from 'src/layout/PaymentDetails/PaymentDetailsTable.module.css';
import type { OrderDetails } from 'src/features/payment/types';

type PaymentDetailsTableProps = {
  orderDetails?: OrderDetails;
  title?: string;
  description?: string;
} & React.HTMLAttributes<HTMLTableElement>;

export const PaymentDetailsTable = ({ orderDetails, title, description, ...rest }: PaymentDetailsTableProps) => (
  <Table
    {...rest}
    className={cn(classes.orderDetailsTable, rest.className)}
  >
    <Caption
      title={title}
      description={description}
    />
    <Table.Head>
      <Table.Row>
        <Table.HeaderCell>Description</Table.HeaderCell>
        <Table.HeaderCell>Quantity</Table.HeaderCell>
        <Table.HeaderCell>Price</Table.HeaderCell>
      </Table.Row>
    </Table.Head>
    <Table.Body>
      {orderDetails?.orderLines.map((orderLine, index) => (
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
        <Table.Cell>{orderDetails?.totalPriceIncVat}</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);
