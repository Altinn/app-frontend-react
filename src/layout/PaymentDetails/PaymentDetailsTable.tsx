import React from 'react';
import type { ReactNode } from 'react';

import { Label, Table } from '@digdir/design-system-react';
import cn from 'classnames';

import { Caption } from 'src/components/form/Caption';
import { Lang } from 'src/features/language/Lang';
import classes from 'src/layout/PaymentDetails/PaymentDetailsTable.module.css';
import type { OrderDetails } from 'src/features/payment/types';

type PaymentDetailsTableProps = {
  orderDetails?: OrderDetails;
  tableTitle?: ReactNode;
  description?: ReactNode;
} & React.HTMLAttributes<HTMLTableElement>;

export const PaymentDetailsTable = ({ orderDetails, tableTitle, description, ...rest }: PaymentDetailsTableProps) => (
  <Table
    {...rest}
    className={cn(classes.orderDetailsTable, rest.className)}
  >
    <Caption
      title={tableTitle}
      description={description}
    />
    <Table.Head>
      <Table.Row>
        <Table.HeaderCell>
          <Lang id='payment.component.description' />
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Lang id='payment.component.quantity' />
        </Table.HeaderCell>
        <Table.HeaderCell>
          <Lang id='payment.component.price' />
        </Table.HeaderCell>
      </Table.Row>
    </Table.Head>
    <Table.Body>
      {orderDetails?.orderLines.map((orderLine, index) => (
        <Table.Row
          key={index}
          className={classes.tableRow}
        >
          <Table.Cell>{orderLine.name}</Table.Cell>
          <Table.Cell align='right'>{orderLine.quantity}</Table.Cell>
          <Table.Cell align='right'>
            {orderLine.priceExVat + orderLine.priceExVat * (orderLine.vatPercent / 100)}
          </Table.Cell>
        </Table.Row>
      ))}
      <Table.Row className={classes.tableRow}>
        <Table.Cell colSpan={2}>
          <Label>
            <Lang id='payment.component.total' />
          </Label>
        </Table.Cell>
        <Table.Cell align='right'>{orderDetails?.totalPriceIncVat}</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
);
